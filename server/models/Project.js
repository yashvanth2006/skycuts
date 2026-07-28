import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['awaiting_assets', 'in_progress', 'in_review', 'paid'],
            default: 'awaiting_assets',
        },
        rawAssets: [
            {
                url: { type: String, required: true },
                label: { type: String, default: 'Raw Footage' },
                submittedAt: { type: Date, default: Date.now },
            },
        ],
        price: { type: Number, required: true, default: 0 },
        stripeSessionId: { type: String, default: null },
    },
    { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
