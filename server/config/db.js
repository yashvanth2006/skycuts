import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Add event listeners to prevent unhandled 'error' events from crashing Node.js
        mongoose.connection.on('connected', () => {
            console.log('✅ Mongoose connected to DB');
        });

        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB Connection Error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB Disconnected. Waiting for reconnect...');
        });

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Initial Connection Success: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Initial MongoDB Connection Failed: ${error.message}`);
        // Removed process.exit(1) to avoid crashing the server if DB goes down temporarily
    }
};

export default connectDB;