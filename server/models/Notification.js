import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        recipient: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        type: {
            type: String,
            enum: ['project_status', 'new_deliverable', 'new_comment', 'payment_received', 'project_accepted'],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        project: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Project',
            required: false
        },
        link: { type: String },
        read: { 
            type: Boolean, 
            default: false 
        },
        emailSent: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
