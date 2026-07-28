import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Number, required: true, default: 0 }, // seconds into the video
        text: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

// Index for fast lookup by project + timestamp sort
commentSchema.index({ project: 1, timestamp: 1 });

export default mongoose.model('Comment', commentSchema);
