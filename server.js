require('dotenv').config(); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. CORS CONFIGURATION ---
// Authorizing your specific Vercel URL to stop the "CORS Policy" error
app.use(cors({
    origin: [
        "https://beautycloud-erp.vercel.app", // Your ACTUAL Vercel URL from the error
        "http://localhost:3000",             // Local development
        "http://localhost:5000",             // Local development 2
        "http://127.0.0.1:5500"              // Live Server
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- 2. MIDDLEWARE ---
app.use(express.json());
// Serves static files if they exist in a public folder
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. SECURITY HEADERS (CSP) ---
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' https://images.unsplash.com data:; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "connect-src 'self' https: *.mongodb.net https://*.onrender.com;"
    );
    next();
});

// --- 4. DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        console.log('⏳ Attempting to connect to MongoDB Atlas...');
        // process.env.MONGO_URI is pulled from your Render Environment Variables
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🚀 ✨ MongoDB Connected Successfully!');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }
};

connectDB(); 

// --- 5. ROUTES ---
// Corrected path to match your 'server/routes' folder structure
const staffRoutes = require('./server/routes/staffRoutes');
const adminRoutes = require('./server/routes/adminRoutes');

app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

// Root route for health check
app.get('/', (req, res) => {
    res.send('WebBeauty API is Running...');
});

// --- 6. START SERVER ---
// Render assigns a dynamic port, so process.env.PORT is mandatory
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
