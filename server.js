require('dotenv').config(); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. CORS CONFIGURATION ---
const allowedOrigins = [
    'https://beautycloud-erp.vercel.app', // Your actual Vercel URL
    'http://localhost:3000'                // For local testing
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman) or if the origin is in our list
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

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// --- 2. MIDDLEWARE ---
app.use(express.json());
// Important: If your HTML files are in /public, this serves them
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
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from environment variables!");
        }
        await mongoose.connect(process.env.MONGO_URI);
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
app.listen(PORT, () => {
    console.log(`✅ Server live on port ${PORT}`);
});
