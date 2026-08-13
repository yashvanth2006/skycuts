import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        // password is optional for Google-only accounts
        password: {
            type: String,
            required: function () { return !this.googleId; },
        },
        googleId: { type: String, unique: true, sparse: true },
        mobileNumber: { type: String },
        role: {
            type: String,
            enum: ['admin', 'client'],
            default: 'client',
        },
    },
    { timestamps: true }
);

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    // Skip if password was not modified, or this is a Google-only account (no password)
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── Compare entered password with stored hash ────────────────────────────────
// Safe contract:
//   - Normal user + correct password  → true
//   - Normal user + wrong password    → false
//   - Google-only user (no hash)      → false  (never calls bcrypt.compare)
//   - enteredPassword is undefined    → false  (never calls bcrypt.compare)
//   - enteredPassword is null/''      → false  (never calls bcrypt.compare)
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Guard 1: this account has no password hash (Google-only or unset)
    if (!this.password) return false;
    // Guard 2: caller passed a falsy value — reject without calling bcrypt
    if (!enteredPassword) return false;
    // Safe: both arguments are guaranteed to be non-empty strings here
    return await bcrypt.compare(String(enteredPassword), this.password);
};

export default mongoose.model('User', userSchema);