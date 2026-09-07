import os
from fastapi import UploadFile, HTTPException, status

# Allowed MIME types for images
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
}

# Maximum file size in bytes (5 MB)
MAX_FILE_SIZE = 5 * 1024 * 1024


def validate_image_file(file: UploadFile) -> None:
    """
    Validate an uploaded image file.
    
    Raises HTTPException if:
    - MIME type is not allowed
    - File size exceeds maximum
    
    Args:
        file: UploadFile to validate
    """
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Seek back to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024)} MB"
        )


def save_uploaded_file(file: UploadFile, upload_dir: str, filename: str) -> str:
    """
    Save an uploaded file to disk.
    
    Args:
        file: UploadFile to save
        upload_dir: Directory to save to
        filename: Filename to use
        
    Returns:
        The relative URL path to the saved file
    """
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    
    try:
        contents = file.file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Return relative URL path
    return f"/uploads/{filename}"


def delete_file(file_url: str, upload_dir: str) -> None:
    """
    Delete a file from disk.
    
    Args:
        file_url: URL path of the file (e.g., /uploads/filename.ext)
        upload_dir: Directory where files are stored
    """
    if file_url and file_url.startswith("/uploads/"):
        filename = file_url.split("/")[-1]
        file_path = os.path.join(upload_dir, filename)
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            # Log error but don't raise - file deletion is not critical
            pass
