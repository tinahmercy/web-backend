require('dotenv').config(); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. CORS CONFIGURATION (CORRECTED) ---
// List of URLs allowed to access your server.
// TODO: Replace the URL below with your real Vercel domain!
const allowedOrigins = [
    'https://your-web-beauty-app.vercel.app', // <-- REPLACE THIS WITH YOUR URL
    'http://localhost:3000' // Optional: for local testing
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman) 
        // OR allow if the origin is in the list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // This is now safe to use
};

app.use(cors(corsOptions));
// ------------------------------------------

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
        "connect-src 'self' https: *.mongodb.net https://*.onrender.com;"
    );
    next();
});

// --- 4. DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        console.log('⏳ Attempting to connect to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🚀 ✨ MongoDB Connected Successfully!');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Stop the app if DB fails
    }
};

connectDB(); 

// --- 5. ROUTES ---
const staffRoutes = require('./server/routes/staffRoutes');
const adminRoutes = require('./server/routes/adminRoutes');

app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

// Root route for health check
app.get('/', (req, res) => {
    res.send('WebBeauty API is Running...');
});

// --- 6. START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
