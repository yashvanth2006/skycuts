import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.AWS_BUCKET_NAME;

/**
 * Uploads a file from local disk to S3.
 * @param {string} filePath    - Local path to the file
 * @param {string} s3Key       - Destination key in S3 bucket
 * @param {string} contentType - MIME type (e.g. 'video/mp2t', 'application/x-mpegURL')
 */
export const uploadFileToS3 = async (filePath, s3Key, contentType) => {
    const fileStream = fs.createReadStream(filePath);
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: fileStream,
        ContentType: contentType,
    });
    await s3.send(command);
    console.log(`☁️  Uploaded to S3: ${s3Key}`);
};

/**
 * Generates a temporary pre-signed URL for private S3 object access.
 * @param {string} s3Key      - The S3 object key
 * @param {number} expiresIn  - Seconds until expiry (default 7200 = 2 hours)
 * @returns {Promise<string>} - The pre-signed URL
 */
export const generatePresignedUrl = async (s3Key, expiresIn = 7200) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
    });
    const url = await getSignedUrl(s3, command, { expiresIn });
    return url;
};

/**
 * Constructs a public-facing HLS playlist URL (for CloudFront or public bucket).
 * If bucket is private, use generatePresignedUrl instead.
 */
export const getHlsPublicUrl = (s3Key) => {
    const region = process.env.AWS_REGION;
    return `https://${BUCKET}.s3.${region}.amazonaws.com/${s3Key}`;
};
