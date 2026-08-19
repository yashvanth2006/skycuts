import mongoose from 'mongoose';

const videoDeliverableSchema = new mongoose.Schema(
    {
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
        
        // Legacy AWS fields (optional for backward compatibility)
        s3OriginalKey: { type: String },
        hlsPlaylistKey: { type: String },
        hlsPlaylistUrl: { type: String },
        
        // New Cloudinary / Media fields
        provider: { type: String, enum: ['cloudinary', 'aws'], default: 'cloudinary' },
        cloudinaryPublicId: { type: String },
        cloudinarySecureUrl: { type: String },
        cloudinaryResourceType: { type: String },
        cloudinaryFormat: { type: String },
        cloudinaryVersion: { type: Number },
        videoUrl: { type: String },

        durationSeconds: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('VideoDeliverable', videoDeliverableSchema);
