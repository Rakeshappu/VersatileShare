
import api from './api';
import { getPresignedDownloadUrl, getKeyFromUrl } from '../lib/storage/s3';

/**
 * Upload a file to storage (AWS S3)
 * For large files, we'll use presigned URLs to upload directly to S3
 */
export const uploadFile = async (file: File, folder: string = 'uploads') => {
  try {
    // For larger files, get a presigned URL
    if (file.size > 5 * 1024 * 1024) { // 5MB threshold
      return uploadLargeFile(file, folder);
    }
    
    // For smaller files, upload directly through our API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to upload file:', error);
    throw error;
  }
};

/**
 * Upload a large file directly to S3 using presigned URL
 */
const uploadLargeFile = async (file: File, folder: string = 'uploads') => {
  try {
    // Get presigned URL
    const presignedResponse = await api.post('/api/upload/presigned', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folder
    });
    
    const { uploadUrl, fileUrl } = presignedResponse.data;
    
    // Upload directly to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }
    
    return {
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
  } catch (error) {
    console.error('Failed to upload large file:', error);
    throw error;
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (fileUrl: string) => {
  try {
    // Extract key from the file URL
    const fileKey = getKeyFromUrl(fileUrl);
    
    const response = await api.delete('/api/upload', {
      data: { fileKey }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw error;
  }
};

/**
 * Get a temporary download URL for a file (with expiration)
 */
export const getDownloadUrl = async (fileUrl: string) => {
  try {
    // For S3 files, get a presigned download URL
    if (fileUrl.includes('amazonaws.com')) {
      const fileKey = getKeyFromUrl(fileUrl);
      return await getPresignedDownloadUrl(fileKey);
    }
    
    // For other storage systems, use the API
    const response = await api.get(`/api/upload/download?fileUrl=${encodeURIComponent(fileUrl)}`);
    return response.data.downloadUrl;
  } catch (error) {
    console.error('Failed to get download URL:', error);
    throw error;
  }
};
