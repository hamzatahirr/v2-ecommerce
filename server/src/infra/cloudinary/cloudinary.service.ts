import cloudinary from "./config";

export class CloudinaryService {
  /**
   * Delete an image from Cloudinary by URL
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract public_id from Cloudinary URL
      const publicId = this.extractPublicId(imageUrl);
      if (!publicId) {
        console.warn("Could not extract public ID from image URL:", imageUrl);
        return false;
      }

      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      return false;
    }
  }

  /**
   * Delete multiple images from Cloudinary
   */
  async deleteImages(imageUrls: string[]): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };

    for (const url of imageUrls) {
      const deleted = await this.deleteImage(url);
      if (deleted) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Extract public_id from Cloudinary URL
   * Supports both folder and non-folder structures
   */
  private extractPublicId(imageUrl: string): string | null {
    try {
      // Handle different Cloudinary URL formats
      // Format 1: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
      // Format 2: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.jpg
      
      const url = new URL(imageUrl);
      const pathname = url.pathname;
      
      // Remove the upload part and extract the path after version
      const uploadIndex = pathname.indexOf('/upload/');
      if (uploadIndex === -1) return null;
      
      const pathAfterUpload = pathname.substring(uploadIndex + 8); // +8 to skip '/upload/'
      
      // Remove version number if present (starts with v followed by digits)
      const versionRegex = /^\/v\d+\//;
      const pathWithoutVersion = pathAfterUpload.replace(versionRegex, '/');
      
      // Remove leading slash and file extension
      const publicIdWithExtension = pathWithoutVersion.startsWith('/') 
        ? pathWithoutVersion.substring(1) 
        : pathWithoutVersion;
      
      const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
      if (lastDotIndex === -1) return null;
      
      return publicIdWithExtension.substring(0, lastDotIndex);
    } catch (error) {
      console.error("Error extracting public ID from URL:", error);
      return null;
    }
  }

  /**
   * Check if URL is a Cloudinary URL
   */
  isCloudinaryUrl(imageUrl: string): boolean {
    return imageUrl.includes('cloudinary.com');
  }
}

export default new CloudinaryService();