import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudinary = async (files: any) => {
  try {
    const uploadPromises = files.map(
      (file: any) =>
        new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                fetch_format: "webp",
                quality: "auto",
                flags: "progressive",
              },
              (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Upload failed"));
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id,
                });
              }
            )
            .end(file.buffer);
        })
    );

    const results = await Promise.allSettled(uploadPromises);
    const successfulUploads = results
      .filter((result) => result.status === "fulfilled")
      .map((result: any) => result.value);

    return successfulUploads;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return [];
  }
};

export const deleteFromCloudinary = async (publicIds: string[]) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return { deleted: [], failed: [] };
    }

    const deletePromises = publicIds.map(publicId =>
      new Promise((resolve) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error || result?.result !== 'ok') {
            console.warn(`Failed to delete image ${publicId}:`, error?.message || 'Unknown error');
            resolve({ success: false, publicId });
          } else {
            resolve({ success: true, publicId });
          }
        });
      })
    );

    const results = await Promise.allSettled(deletePromises);
    const deleted: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const value = result.value as { success: boolean; publicId: string };
        if (value.success) {
          deleted.push(publicIds[index]);
        } else {
          failed.push(publicIds[index]);
        }
      } else {
        failed.push(publicIds[index]);
      }
    });

    console.log(`Cloudinary deletion: ${deleted.length} deleted, ${failed.length} failed`);
    return { deleted, failed };
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return { deleted: [], failed: publicIds };
  }
};

export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.extension
    const matches = url.match(/\/upload\/v\d+\/(.+?)(?:\.\w+)?$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  } catch (error) {
    console.error("Error extracting public ID from URL:", error);
    return null;
  }
};
