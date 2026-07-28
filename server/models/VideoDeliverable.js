import mongoose from 'mongoose';

const videoDeliverableSchema = new mongoose.Schema(
    {
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
        s3OriginalKey: { type: String, required: true },
        hlsPlaylistKey: { type: String, required: true },
        hlsPlaylistUrl: { type: String, required: true },
        durationSeconds: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('VideoDeliverable', videoDeliverableSchema);
