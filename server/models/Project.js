import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        projectRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest' },
        status: {
            type: String,
            enum: ['awaiting_assets', 'in_progress', 'in_review', 'paid', 'delivered'],
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
        paymentProvider: { type: String, enum: ['razorpay'], default: undefined },
        paymentOrderId: { type: String, default: null },
        paymentId: { type: String, default: null },
        paymentSignature: { type: String, default: null },
        paymentStatus: {
            type: String,
            enum: ['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED'],
            default: undefined,
        },
        paymentVerifiedAt: { type: Date, default: null },
        paymentAmount: { type: Number, default: null },
        paymentCurrency: { type: String, default: 'INR' },
    },
    { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
