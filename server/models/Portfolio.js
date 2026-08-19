import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
    {
        editor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        category: { type: String },
        thumbnail: { type: String },
        videoUrl: { type: String },
        
        provider: { type: String, enum: ['cloudinary', 'aws'], default: 'cloudinary' },
        cloudinaryPublicId: { type: String },
        cloudinarySecureUrl: { type: String },
        cloudinaryResourceType: { type: String },
        cloudinaryFormat: { type: String },
        
        isPublished: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('Portfolio', portfolioSchema);
