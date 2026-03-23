require('dotenv').config(); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors'); // 1. Added CORS 🛰️

const app = express();

// --- 2. CORS CONFIGURATION ---
// This allows your Vercel frontend to talk to this Render backend
app.use(cors({
    origin: [
        "https://webbeauty-app.vercel.app", // Replace with your ACTUAL Vercel URL
        "http://localhost:3000", 
        "http://127.0.0.1:5500"
    ],
    credentials: true
}));

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. UPDATED CSP HEADER ---
// Added 'connect-src' to allow connections to your Render URL and MongoDB
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' https://images.unsplash.com data:; " +
        "font-src https://fonts.gstatic.com; " +
        "connect-src 'self' https: *.mongodb.net https://*.onrender.com;" // Added Render permission
    );
    next();
});

// --- DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        console.log('⏳ Attempting to connect to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 20000, 
        });
        console.log('🚀 ✨ MongoDB Connected Successfully!');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        // Don't exit process in production unless it's a fatal startup error
    }
};

connectDB(); 

// --- ROUTES ---
// Ensure the path to your routes is correct based on your folder structure
const staffRoutes = require('./server/routes/staffRoutes');
app.use('/api/staff', staffRoutes);

// --- START SERVER ---
// Render automatically assigns a PORT, so process.env.PORT is CRITICAL
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});