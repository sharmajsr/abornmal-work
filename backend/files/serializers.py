from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = ['id', 'name', 'size', 'content_type', 'hash_type', 'file_hash', 
                  'uploaded_at', 'download_url']
        read_only_fields = ['id', 'size', 'content_type', 'hash_type', 'file_hash', 
                           'uploaded_at', 'download_url']
    
    def get_download_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    hash_type = serializers.ChoiceField(choices=File.HASH_CHOICES, default='blake3', required=False)
    
    def validate_file(self, value):
        if value.size > 100 * 1024 * 1024:  # 100MB limit
            raise serializers.ValidationError("File size cannot exceed 100MB")
        return value 