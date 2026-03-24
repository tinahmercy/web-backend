require('dotenv').config(); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. CORS CONFIGURATION ---
const allowedOrigins = [
    'https://beautycloud-erp.vercel.app',
    'http://localhost:3000'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS Blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
};

// This middleware handles BOTH normal requests AND OPTIONS (preflight) automatically.
app.use(cors(corsOptions));

// --- 2. MIDDLEWARE ---
app.use(express.json());
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
        "connect-src 'self' https: http://localhost:3000 *.mongodb.net https://*.onrender.com https://beautycloud-erp.vercel.app;"
    );
    next();
});

// --- 4. DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error("❌ CRITICAL: MONGO_URI is missing from Render Environment Variables!");
            return;
        }
        await mongoose.connect(mongoURI);
        console.log('🚀 ✨ MongoDB Connected Successfully!');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }
};
connectDB(); 

// --- 5. ROUTES ---
const staffRoutes = require('./server/routes/staffRoutes');
const adminRoutes = require('./server/routes/adminRoutes');

app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('WebBeauty API is Running...');
});

// --- 6. START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server live on port ${PORT}`);
});
