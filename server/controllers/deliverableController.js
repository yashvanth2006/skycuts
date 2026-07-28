import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import VideoDeliverable from '../models/VideoDeliverable.js';
import Project from '../models/Project.js';
import { transcodeToHLS } from '../utils/ffmpegHelper.js';
import { uploadFileToS3, getHlsPublicUrl, generatePresignedUrl } from '../utils/s3Helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc   Upload final .mp4, transcode to HLS, push to S3 (Admin only)
// @route  POST /api/deliverables/:projectId
export const uploadDeliverable = async (req, res) => {
    const { projectId } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'No video file uploaded' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Project not found' });
    }

    const inputPath = req.file.path;
    const hlsOutputDir = path.join(__dirname, '..', 'uploads', 'hls', projectId);

    try {
        // 1. Transcode to HLS locally
        console.log('🎬 Starting HLS transcode...');
        await transcodeToHLS(inputPath, hlsOutputDir);

        // 2. Upload original .mp4 to S3
        const originalS3Key = `originals/${projectId}/original.mp4`;
        await uploadFileToS3(inputPath, originalS3Key, 'video/mp4');

        // 3. Upload all HLS files to S3
        const hlsFiles = fs.readdirSync(hlsOutputDir);
        const playlistS3Key = `hls/${projectId}/playlist.m3u8`;

        for (const file of hlsFiles) {
            const filePath = path.join(hlsOutputDir, file);
            const contentType = file.endsWith('.m3u8')
                ? 'application/x-mpegURL'
                : 'video/mp2t';
            await uploadFileToS3(filePath, `hls/${projectId}/${file}`, contentType);
        }

        // 4. Build public HLS URL
        const hlsPlaylistUrl = getHlsPublicUrl(playlistS3Key);

        // 5. Save deliverable record
        let deliverable = await VideoDeliverable.findOne({ project: projectId });
        if (deliverable) {
            deliverable.s3OriginalKey = originalS3Key;
            deliverable.hlsPlaylistKey = playlistS3Key;
            deliverable.hlsPlaylistUrl = hlsPlaylistUrl;
            await deliverable.save();
        } else {
            deliverable = await VideoDeliverable.create({
                project: projectId,
                s3OriginalKey: originalS3Key,
                hlsPlaylistKey: playlistS3Key,
                hlsPlaylistUrl,
            });
        }

        // 6. Update project status to 'in_review'
        project.status = 'in_review';
        await project.save();

        // 7. Cleanup local temp files
        fs.unlinkSync(inputPath);
        fs.rmSync(hlsOutputDir, { recursive: true, force: true });

        res.status(201).json({ message: 'Deliverable uploaded and transcoded successfully', deliverable });
    } catch (err) {
        console.error('❌ Deliverable upload failed:', err.message);
        // Cleanup on error
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(hlsOutputDir)) fs.rmSync(hlsOutputDir, { recursive: true, force: true });
        res.status(500).json({ message: 'Video processing failed', error: err.message });
    }
};

// @desc   Get deliverable for a project (returns HLS URL)
// @route  GET /api/deliverables/:projectId
export const getDeliverable = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'client' && project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    const deliverable = await VideoDeliverable.findOne({ project: projectId });
    if (!deliverable) return res.status(404).json({ message: 'No deliverable uploaded yet' });

    res.json(deliverable);
};

// @desc   Generate pre-signed URL for final download (project must be 'paid')
// @route  GET /api/deliverables/:projectId/download
export const getDownloadUrl = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Security: client must own the project
    if (req.user.role === 'client' && project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    // Payment gate
    if (project.status !== 'paid') {
        return res.status(402).json({ message: 'Payment required to download the final file' });
    }

    const deliverable = await VideoDeliverable.findOne({ project: projectId });
    if (!deliverable) return res.status(404).json({ message: 'Deliverable not found' });

    const signedUrl = await generatePresignedUrl(deliverable.s3OriginalKey, 7200);
    res.json({ downloadUrl: signedUrl, expiresIn: 7200 });
};
