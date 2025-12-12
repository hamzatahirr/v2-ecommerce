import cloudinary from "@/infra/cloudinary/config";
import { UploadApiResponse } from "cloudinary";
import AppError from "@/shared/errors/AppError";

export class VerificationService {
  /**
   * Upload a document to Cloudinary
   * @param fileBuffer The file buffer to upload
   * @param fileName The original file name
   * @param userId The user ID for organizing files
   * @param documentType The type of document (studentIdCard or feeChallan)
   * @returns The Cloudinary upload response
   */
  async uploadDocument(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
    documentType: "studentIdCard" | "feeChallan"
  ): Promise<UploadApiResponse> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (!fileExtension || !['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension)) {
        throw new AppError(400, "Invalid file type. Only JPG, PNG, and PDF files are allowed.");
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (fileBuffer.length > maxSize) {
        throw new AppError(400, "File size too large. Maximum size is 5MB.");
      }

      // Generate unique public ID
      const timestamp = Date.now();
      const publicId = `verification/${userId}/${documentType}_${timestamp}`;

      // Upload to Cloudinary
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: fileExtension === 'pdf' ? 'raw' : 'image',
            public_id: publicId,
            folder: `verification/${userId}`,
            format: fileExtension === 'pdf' ? 'pdf' : undefined,
            transformation: fileExtension !== 'pdf' ? [
              { width: 800, height: 600, crop: 'limit' }, // Resize images
              { quality: 'auto' } // Auto quality optimization
            ] : undefined,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error('Upload failed'));
            }
          }
        ).end(fileBuffer);
      });

      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, "Failed to upload document. Please try again.");
    }
  }

  /**
   * Delete a document from Cloudinary
   * @param publicId The public ID of the file to delete
   */
  async deleteDocument(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      // Don't throw error for delete failures as it might not be critical
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param url The Cloudinary URL
   * @returns The public ID
   */
  extractPublicId(url: string): string | null {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Validate document URLs
   * @param urls Array of document URLs to validate
   */
  validateDocumentUrls(urls: (string | undefined)[]): void {
    for (const url of urls) {
      if (url && !url.includes('cloudinary.com')) {
        throw new AppError(400, "Invalid document URL. Only Cloudinary URLs are allowed.");
      }
    }
  }
}
