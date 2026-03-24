const express = require('express');
const router = express.Router();

// Import Models directly
const User = require('../models/User');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');

// --- 1. ADMIN STATS ---
router.get('/stats', async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'PAID' });
        const stats = {
            revenue: bookings.reduce((sum, b) => sum + (b.price || 0), 0),
            cash: bookings.filter(b => b.method === 'CASH').reduce((sum, b) => sum + (b.price || 0), 0),
            wallet: bookings.filter(b => b.method === 'WALLET').reduce((sum, b) => sum + (b.price || 0), 0)
        };
        res.json(stats);
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ revenue: 0, cash: 0, wallet: 0 });
    }
});

// --- 2. ADMIN USERS ---
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Security: Hide hashes
        res.json(users);
    } catch (err) {
        res.status(500).json([]);
    }
});

// --- 3. DELETE USER ---
router.post('/users/delete', async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findById(id);
        if (user && user.role === 'admin') {
            return res.status(400).json({ success: false, message: "Cannot delete admin" });
        }
        await User.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// --- 4. ADMIN ATTENDANCE ---
router.get('/attendance', async (req, res) => {
    try {
        const today = new Date().toDateString();
        const records = await Attendance.find({ date: today });
        res.json(records);
    } catch (err) {
        res.status(500).json([]);
    }
});

module.exports = router;
