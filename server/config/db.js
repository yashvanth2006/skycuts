import mongoose from 'mongoose';

// ─── Register connection lifecycle events ONCE at module load time ────────────
// This prevents duplicate listeners if connectDB() is ever called more than once.

mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB: connection established');
});

mongoose.connection.on('error', (err) => {
    // Log but do NOT exit — let Mongoose attempt to recover
    console.error(`❌ MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB: disconnected — Mongoose will attempt to reconnect automatically');
});

// Mongoose 7+ emits 'reconnected' after a successful reconnect
mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB: reconnected successfully');
});

// ─── Initial Connection ───────────────────────────────────────────────────────
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB initial connection: ${conn.connection.host}`);
    } catch (error) {
        // Log the initial failure clearly — do NOT call process.exit(1)
        // The server will start but DB-dependent endpoints will fail gracefully
        // (each controller has its own try/catch to handle DB unavailability)
        console.error(`❌ MongoDB initial connection FAILED: ${error.message}`);
        console.error('   Server is running without a database connection.');
        console.error('   DB-dependent API calls will return 500 until MongoDB reconnects.');
    }
};

export default connectDB;