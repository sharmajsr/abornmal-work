from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import File
from .serializers import FileSerializer, FileUploadSerializer
import os
from django.conf import settings

# Create your views here.

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FileUploadSerializer
        return FileSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Order by most recent first
        queryset = queryset.order_by('-uploaded_at')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uploaded_file = serializer.validated_data['file']
        hash_type = serializer.validated_data.get('hash_type', 'blake3')
        
        # Read file content for hash calculation
        file_content = uploaded_file.read()
        file_hash = File.calculate_hash(file_content, hash_type)
        
        # Reset file pointer for later use
        uploaded_file.seek(0)
        
        # Check if file with same hash already exists
        existing_file = File.objects.filter(file_hash=file_hash).first()
        
        # Create new file record regardless of whether the file exists
        file_obj = File(
            file=uploaded_file,
            name=uploaded_file.name,
            size=uploaded_file.size,
            content_type=uploaded_file.content_type,
            hash_type=hash_type,
            file_hash=file_hash
        )
        
        # If the file already exists, we'll use its physical location
        # This is handled in the model's save method
        file_obj.save()
        
        response_serializer = FileSerializer(file_obj, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if other files are using the same physical file
        same_hash_count = File.objects.filter(file_hash=instance.file_hash).count()
        
        # Only delete the physical file if this is the last reference to it
        if same_hash_count <= 1:
            # Delete the physical file
            if instance.file:
                if os.path.isfile(os.path.join(settings.MEDIA_ROOT, instance.file.name)):
                    os.remove(os.path.join(settings.MEDIA_ROOT, instance.file.name))
        
        # Always delete the database record
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
