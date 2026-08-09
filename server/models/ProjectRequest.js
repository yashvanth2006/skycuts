import mongoose from 'mongoose';

const projectRequestSchema = new mongoose.Schema(
    {
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        editor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title: { type: String, required: true },
        type: { type: String, required: true },
        description: { type: String, default: '' },
        requirements: { type: String, default: '' },
        deadline: { type: Date },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

export default mongoose.model('ProjectRequest', projectRequestSchema);
