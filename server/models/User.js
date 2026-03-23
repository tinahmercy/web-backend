const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['staff', 'admin'], default: 'staff' }
});

// 🔒 THE ENCRYPTION HOOK (Updated for Async)
UserSchema.pre('save', async function() {
    // 1. Only hash the password if it's new or being changed
    if (!this.isModified('password')) return;

    try {
        console.log("🔐 Encrypting password for:", this.name);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // No 'next()' needed here because the function is 'async'
    } catch (err) {
        throw err; // Mongoose will catch this error
    }
});

module.exports = mongoose.model('User', UserSchema);