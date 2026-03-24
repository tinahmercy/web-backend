require('dotenv').config(); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. CORS CONFIGURATION (Fixed Conflict) ---
const allowedOrigins = [
    'https://your-web-beauty-app.vercel.app', // <--- REPLACE WITH YOUR ACTUAL VERCEL URL
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like Postman) or if in whitelist
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

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
        // Added 'https:' generally to connect-src to be less restrictive during debug
        "connect-src 'self' https: http://localhost:3000 *.mongodb.net https://*.onrender.com;"
    );
    next();
});

// --- 4. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🚀 ✨ MongoDB Connected Successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

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
    console.log(`✅ Server running on port ${PORT}`);
});
