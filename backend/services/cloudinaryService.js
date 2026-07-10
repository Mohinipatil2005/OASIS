import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a file buffer directly to Cloudinary using a stream.
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {string} folder - Destination folder on Cloudinary.
 * @returns {Promise<object>} Cloudinary upload response object.
 */
export const uploadBufferToCloudinary = (fileBuffer, folder = 'pizza_platform') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
      // Fallback if Cloudinary is not configured
      console.warn('Cloudinary not configured. Mocking upload.');
      return resolve({
        secure_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop',
        public_id: 'mock_pizza_image_id'
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Uploads a local file path to Cloudinary.
 * @param {string} filePath - Path of the file on disk.
 * @param {string} folder - Destination folder on Cloudinary.
 * @returns {Promise<object>} Cloudinary upload response object.
 */
export const uploadFileToCloudinary = async (filePath, folder = 'pizza_platform') => {
  try {
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
      console.warn('Cloudinary not configured. Mocking upload.');
      return {
        secure_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop',
        public_id: 'mock_pizza_image_id'
      };
    }
    return await cloudinary.uploader.upload(filePath, { folder });
  } catch (error) {
    throw new Error(`Cloudinary Upload Failed: ${error.message}`);
  }
};
