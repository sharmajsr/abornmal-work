from django.db import models
import uuid
import os
import hashlib
import blake3

def get_file_path(instance, filename):
    """Generate a unique path for uploaded files based on hash"""
    ext = filename.split('.')[-1]
    # Use the hash as part of the filename to ensure deduplication
    if instance.file_hash:
        filename = f"{instance.file_hash}.{ext}"
    else:
        filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads', filename)

class File(models.Model):
    HASH_CHOICES = [
        ('blake3', 'Blake3'),
        ('md5', 'MD5'),
        ('sha256', 'SHA256'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=get_file_path)
    name = models.CharField(max_length=255)
    size = models.IntegerField()
    content_type = models.CharField(max_length=100)
    hash_type = models.CharField(max_length=10, choices=HASH_CHOICES, default='blake3')
    file_hash = models.CharField(max_length=128, db_index=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    @staticmethod
    def calculate_hash(file_data, hash_type='blake3'):
        """Calculate file hash using the specified algorithm"""
        if hash_type == 'blake3':
            return blake3.blake3(file_data).hexdigest()
        elif hash_type == 'md5':
            return hashlib.md5(file_data).hexdigest()
        elif hash_type == 'sha256':
            return hashlib.sha256(file_data).hexdigest()
        else:
            # Default to blake3
            return blake3.blake3(file_data).hexdigest()
    
    def save(self, *args, **kwargs):
        # If this is a new file (no ID yet) and we have a hash,
        # check if we need to actually save the file or just reference an existing one
        if not self.pk and self.file_hash:
            existing_file = File.objects.filter(file_hash=self.file_hash).first()
            if existing_file:
                # Use the same physical file path as the existing file
                self.file.name = existing_file.file.name
        super().save(*args, **kwargs)
