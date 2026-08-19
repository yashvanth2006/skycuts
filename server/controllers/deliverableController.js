import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import VideoDeliverable from '../models/VideoDeliverable.js';
import Project from '../models/Project.js';
import { uploadLargeVideo, deleteMedia } from '../services/cloudinaryService.js';

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

    let cloudResult = null;
    let localFileCleaned = false;

    const cleanupLocalFile = () => {
        if (!localFileCleaned && fs.existsSync(inputPath)) {
            try {
                fs.unlinkSync(inputPath);
                localFileCleaned = true;
                console.log('[DELIVERABLE] Local temp file cleaned up successfully');
            } catch (fsErr) {
                console.error('[DELIVERABLE] Temp file cleanup failed (likely EBUSY on Windows):', fsErr.message);
                // On Windows, EBUSY might resolve shortly after. A robust system might use setTimeout to retry, but we'll ignore for now.
            }
        }
    };

    try {
        console.log(`[DELIVERABLE] Upload started for project ${projectId}`);
        const folder = `skycuts/projects/${projectId}/deliverables`;
        
        console.log('[DELIVERABLE] Cloudinary upload started');
        cloudResult = await uploadLargeVideo(inputPath, folder);
        console.log(`[DELIVERABLE] Cloudinary upload successful. Public ID: ${cloudResult.public_id}`);
        
        // Immediately try to cleanup local file since Cloudinary upload stream is finished.
        cleanupLocalFile();
    } catch (cloudErr) {
        console.error('[DELIVERABLE] Cloudinary upload failed:', cloudErr);
        cleanupLocalFile();
        return res.status(502).json({ message: 'Cloudinary upload failed', error: cloudErr.message });
    }

    let deliverable;
    try {
        console.log('[DELIVERABLE] MongoDB save started');
        deliverable = await VideoDeliverable.findOne({ project: projectId });
        
        const updateData = {
            provider: 'cloudinary',
            cloudinaryPublicId: cloudResult.public_id,
            cloudinarySecureUrl: cloudResult.secure_url,
            cloudinaryResourceType: cloudResult.resource_type,
            cloudinaryFormat: cloudResult.format,
            videoUrl: cloudResult.secure_url,
        };

        if (deliverable) {
            Object.assign(deliverable, updateData);
            await deliverable.save();
            console.log('[DELIVERABLE] MongoDB update successful');
        } else {
            deliverable = await VideoDeliverable.create({
                project: projectId,
                ...updateData
            });
            console.log('[DELIVERABLE] MongoDB creation successful');
        }
    } catch (dbErr) {
        console.error('[DELIVERABLE] MongoDB save failed:', dbErr);
        
        // Attempt cleanup of the uploaded Cloudinary asset to prevent orphaned files
        if (cloudResult && cloudResult.public_id) {
            try {
                console.log(`[DELIVERABLE] Attempting to rollback Cloudinary upload: ${cloudResult.public_id}`);
                await deleteMedia(cloudResult.public_id, cloudResult.resource_type);
                console.log('[DELIVERABLE] Cloudinary rollback successful');
            } catch (rollbackErr) {
                console.error('[DELIVERABLE] Cloudinary rollback failed:', rollbackErr.message);
            }
        }
        
        cleanupLocalFile();
        return res.status(500).json({ message: 'Database save failed', error: dbErr.message });
    }

    try {
        project.status = 'in_review';
        await project.save();
        console.log('[DELIVERABLE] Project update successful');
    } catch (projErr) {
        console.error('[DELIVERABLE] Project update failed:', projErr);
        // We do not rollback DB/Cloudinary for project status error, as the asset is safely stored.
        cleanupLocalFile();
        return res.status(500).json({ message: 'Project status update failed', error: projErr.message });
    }

    console.log('[DELIVERABLE] Response sent');
    res.status(201).json({ message: 'Deliverable uploaded successfully', deliverable });
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
