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
        // Allow requests with no origin (like Postman) or if in whitelist
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

// Apply CORS middleware globally
app.use(cors(corsOptions));

// FIXED: Node v22 / Path-to-Regexp Fix
// The syntax '/(.*)' or '*' is deprecated. We use '/:any*' to name the parameter.
app.options('/:any*', cors(corsOptions)); 

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
        // Check for the variable before trying to connect
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error("❌ CRITICAL ERROR: MONGO_URI is missing from Environment Variables!");
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
// Ensure these paths exist in your project exactly as written
const staffRoutes = require('./server/routes/staffRoutes');
const adminRoutes = require('./server/routes/adminRoutes');

app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('WebBeauty API is Running...');
});

// --- 6. START SERVER (Render Port Binding Fix) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server live on port ${PORT}`);
});
