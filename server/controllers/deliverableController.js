import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import VideoDeliverable from '../models/VideoDeliverable.js';
import Project from '../models/Project.js';
import { uploadLargeVideo } from '../services/cloudinaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc   Upload final .mp4 to Cloudinary (Admin only)
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

    try {
        console.log('🎬 Starting Cloudinary large video upload...');
        const folder = `skycuts/projects/${projectId}/deliverables`;
        
        const result = await uploadLargeVideo(inputPath, folder);

        // Save deliverable record
        let deliverable = await VideoDeliverable.findOne({ project: projectId });
        
        const updateData = {
            provider: 'cloudinary',
            cloudinaryPublicId: result.public_id,
            cloudinarySecureUrl: result.secure_url,
            cloudinaryResourceType: result.resource_type,
            cloudinaryFormat: result.format,
            videoUrl: result.secure_url,
        };

        if (deliverable) {
            Object.assign(deliverable, updateData);
            await deliverable.save();
        } else {
            deliverable = await VideoDeliverable.create({
                project: projectId,
                ...updateData
            });
        }

        // Update project status to 'in_review'
        project.status = 'in_review';
        await project.save();

        // Cleanup local temp file
        fs.unlinkSync(inputPath);

        res.status(201).json({ message: 'Deliverable uploaded successfully', deliverable });
    } catch (err) {
        console.error('❌ Deliverable upload failed:', err);
        // Cleanup on error
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        res.status(500).json({ message: 'Upload failed. Please try again.', error: err.message });
    }
};

// @desc   Get deliverable for a project
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

// @desc   Generate download URL for final deliverable (project must be 'paid')
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
    if (project.status !== 'paid' && project.status !== 'PAID' && project.status !== 'DELIVERED') {
        return res.status(402).json({ message: 'Payment required to download the final file' });
    }

    const deliverable = await VideoDeliverable.findOne({ project: projectId });
    if (!deliverable) return res.status(404).json({ message: 'Deliverable not found' });

    if (deliverable.provider === 'cloudinary' || deliverable.cloudinarySecureUrl) {
        // Adding fl_attachment ensures browser triggers a file download
        const downloadUrl = deliverable.cloudinarySecureUrl.replace('/upload/', '/upload/fl_attachment/');
        res.json({ downloadUrl: downloadUrl, expiresIn: null });
    } else {
        if (deliverable.s3OriginalKey) {
            // Since AWS S3 access is removed, we cannot generate presigned URL.
            // If the old video was public, we could construct a URL.
            // Since HLS URL was public, let's use that as fallback if available.
            res.json({ downloadUrl: deliverable.hlsPlaylistUrl, expiresIn: null });
        } else {
            res.status(500).json({ message: 'Legacy deliverable cannot be downloaded without migration.' });
        }
    }
};
