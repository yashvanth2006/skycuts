import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import deliverableRoutes from './routes/deliverableRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import Message from './models/Message.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
['uploads/raw', 'uploads/hls'].forEach((dir) => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

// ─── Socket.io ──────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

// ─── Middleware ──────────────────────────────────────────────────────────────
// Stripe webhook MUST receive raw body — mount BEFORE express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/stripe', stripeRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'active', app: 'SkyCuts API', timestamp: new Date().toISOString() });
});

// ─── Socket.io — Real-Time Chat Engine ──────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // Client joins a project-scoped private room
    socket.on('join_project', (projectId) => {
        socket.join(projectId);
        console.log(`👤 ${socket.id} joined room: ${projectId}`);
    });

    // Receive message, persist to DB, broadcast to room
    socket.on('send_message', async ({ projectId, senderId, senderName, senderRole, text }) => {
        try {
            const message = await Message.create({
                project: projectId,
                sender: senderId,
                text,
            });

            const payload = {
                _id: message._id,
                project: projectId,
                sender: { _id: senderId, name: senderName, role: senderRole },
                text,
                createdAt: message.createdAt,
            };

            // Emit to everyone in the room (including sender)
            io.to(projectId).emit('receive_message', payload);
        } catch (err) {
            console.error('❌ Message save failed:', err.message);
            socket.emit('message_error', { message: 'Failed to send message' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔥 Client disconnected: ${socket.id}`);
    });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 SkyCuts API running on http://localhost:${PORT}`);
});