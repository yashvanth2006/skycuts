import dns from 'dns';
dns.setServers(['8.8.8.8','8.8.4.4']);
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
import projectRequestRoutes from './routes/projectRequestRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import Message from './models/Message.js';
import User from './models/User.js';
import Project from './models/Project.js';
import jwt from 'jsonwebtoken';
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

const allowedOrigins = process.env.MULTI_ORIGIN_CORS 
    ? process.env.MULTI_ORIGIN_CORS.split(',') 
    : [process.env.CLIENT_URL || 'http://localhost:5173'];

// ─── Socket.io ──────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
    },
});

// ─── Middleware ──────────────────────────────────────────────────────────────
// Stripe webhook MUST receive raw body — mount BEFORE express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
    origin: allowedOrigins,
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
app.use('/api/project-requests', projectRequestRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'active', app: 'SkyCuts API', timestamp: new Date().toISOString() });
});

// ─── Socket.io — Real-Time Chat Engine ──────────────────────────────────────

// Authentication Middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: No token provided'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId || decoded.id).select('-password');
        
        if (!user) return next(new Error('Authentication error: User not found'));
        
        socket.user = user;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
});

io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id} (User: ${socket.user.email})`);

    // Client joins a project-scoped private room
    socket.on('join_project', async (projectId) => {
        try {
            const project = await Project.findById(projectId);
            if (!project) {
                return socket.emit('socket_error', { message: 'Project not found' });
            }

            // Authorization: Must be Admin OR the assigned Client
            if (socket.user.role !== 'admin' && project.client.toString() !== socket.user._id.toString()) {
                console.log(`🚫 Unauthorized join attempt by ${socket.user.email} for project ${projectId}`);
                return socket.emit('socket_error', { message: 'Unauthorized to access this project workspace' });
            }

            socket.join(projectId);
            console.log(`👤 ${socket.id} joined room: ${projectId}`);
        } catch (err) {
            socket.emit('socket_error', { message: 'Failed to join project room' });
        }
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