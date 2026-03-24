require('dotenv').config(); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. CORS CONFIGURATION ---
// These are the only origins allowed to talk to your API
const allowedOrigins = [
    'https://beautycloud-erp.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500', // For VS Code Live Server testing
    'http://localhost:5000'
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) or matching origins
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`CORS Blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200 
};

// Apply CORS before any routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

// --- 2. MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
        "connect-src 'self' https: http://localhost:3000 http://localhost:5000 *.mongodb.net https://*.onrender.com https://beautycloud-erp.vercel.app;"
    );
    next();
});

// --- 4. DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error("❌ CRITICAL: MONGO_URI is missing from Environment!");
            return;
        }
        // Simplified connection for Mongoose 6+ / 7+ / 8+
        await mongoose.connect(mongoURI);
        console.log('🚀 ✨ MongoDB Connected Successfully!');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        // Don't kill the process, let Render try to restart it
    }
};
connectDB(); 

// --- 5. ROUTES ---
const staffRoutes = require('./server/routes/staffRoutes');
const adminRoutes = require('./server/routes/adminRoutes');

// API Endpoints
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

// Health Check / Root
app.get('/', (req, res) => {
    res.json({ status: "running", message: "WebBeauty API is Live" });
});

// --- 6. START SERVER ---
// Render provides the PORT variable automatically
const PORT = process.env.PORT || 10000; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server live on port ${PORT}`);
});
