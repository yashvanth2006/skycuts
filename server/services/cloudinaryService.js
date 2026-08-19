import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a large video file to Cloudinary using chunked upload.
 * @param {string} filePath - Local path to the video file
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadLargeVideo = (filePath, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(
            filePath,
            {
                resource_type: 'video',
                folder: folder,
                chunk_size: 6000000, // 6MB chunks
            },
            (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload error:', error);
                    return reject(error);
                }
                resolve(result);
            }
        );
    });
};

/**
 * Uploads an image or generic file to Cloudinary.
 * @param {string} filePath - Local path to the file
 * @param {string} folder - Destination folder in Cloudinary
 * @param {string} resourceType - Resource type (image, raw)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadMedia = (filePath, folder, resourceType = 'image') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            {
                resource_type: resourceType,
                folder: folder,
            },
            (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload error:', error);
                    return reject(error);
                }
                resolve(result);
            }
        );
    });
};

/**
 * Deletes a media asset from Cloudinary.
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (video, image, raw)
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export const deleteMedia = (publicId, resourceType = 'video') => {
    return new Promise((resolve, reject) => {
        if (!publicId) return resolve(null);
        cloudinary.uploader.destroy(
            publicId,
            { resource_type: resourceType },
            (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary deletion error:', error);
                    return reject(error);
                }
                resolve(result);
            }
        );
    });
};
