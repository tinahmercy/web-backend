const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // 👈 Added for password comparison

// Import Models
const User = require('../models/User');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');

// --- AUTH API ---

// Login (Updated for Encryption)
router.post('/login', async (req, res) => {
    try {
        const username = req.body.username.trim();
        const password = req.body.password.trim();

        // 1. Find user (Case insensitive name search)
        const user = await User.findOne({ 
            name: { $regex: new RegExp(`^${username}$`, "i") } 
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid username" });
        }

        // 2. CHECK ENCRYPTED PASSWORD 🔒
        // This compares the plain text password from the form with the hashed version in MongoDB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        // 3. Return success
        res.json({ 
            success: true, 
            user: { id: user._id, name: user.name, role: user.role } 
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Register (Updated to trigger the Model Hook)
router.post('/register', async (req, res) => {
    try {
        const name = req.body.name.trim();
        const email = req.body.email.trim();
        const password = req.body.password.trim();
        const role = req.body.role || 'staff';

        // Check if user exists
        const existingUser = await User.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, "i") } 
        });
        
        if (existingUser) {
            return res.json({ success: false, message: "Username already taken" });
        }

        // 🚀 Create user using 'new User' so the .pre('save') hook in User.js encrypts the password
        const newUser = new User({ name, email, password, role });
        await newUser.save();
        
        res.json({ success: true, user: { id: newUser._id, name: newUser.name, role: newUser.role } });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, message: "Error creating user" });
    }
});

// --- BOOKINGS API ---

// Get all bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        console.error("Get Bookings Error:", err);
        res.status(500).json([]);
    }
});

// Create booking
router.post('/bookings', async (req, res) => {
    try {
        const newBooking = new Booking({
            ...req.body,
            status: 'PENDING'
        });
        await newBooking.save();
        res.json({ success: true, booking: newBooking });
    } catch (err) {
        console.error("Create Booking Error:", err);
        res.status(500).json({ success: false });
    }
});

// Update Booking (Complete / Pay)
router.put('/bookings/:id/:action', async (req, res) => {
    const { id, action } = req.params;
    const { method, staffId, staffName } = req.body;

    try {
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (action === 'complete') {
            booking.status = 'COMPLETED';
        } else if (action === 'pay') {
            booking.status = 'PAID';
            booking.method = method;
            booking.staffId = staffId;
            booking.staffName = staffName;
        }

        await booking.save();
        res.json({ success: true });
    } catch (err) {
        console.error("Update Booking Error:", err);
        res.status(500).json({ success: false });
    }
});

// --- ATTENDANCE API ---

router.post('/attendance', async (req, res) => {
    const { staffId, staffName, type, time } = req.body;
    const today = new Date().toDateString();

    try {
        if (type === 'CLOCK_IN') {
            const newRecord = new Attendance({
                staffId, 
                staffName, 
                date: today,
                clockIn: new Date(time).toLocaleTimeString(),
                clockOut: null
            });
            await newRecord.save();
        } else if (type === 'CLOCK_OUT') {
            const record = await Attendance.findOne({ staffId, date: today, clockOut: null });
            if (record) {
                record.clockOut = new Date(time).toLocaleTimeString();
                await record.save();
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Attendance Error:", err);
        res.status(500).json({ success: false });
    }
});

// --- ADMIN API ---

router.get('/admin/stats', async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'PAID' });
        const stats = {
            revenue: bookings.reduce((sum, b) => sum + (b.price || 0), 0),
            cash: bookings.filter(b => b.method === 'CASH').reduce((sum, b) => sum + (b.price || 0), 0),
            wallet: bookings.filter(b => b.method === 'WALLET').reduce((sum, b) => sum + (b.price || 0), 0)
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ revenue: 0, cash: 0, wallet: 0 });
    }
});

router.get('/admin/attendance', async (req, res) => {
    try {
        const today = new Date().toDateString();
        const records = await Attendance.find({ date: today });
        res.json(records);
    } catch (err) {
        res.status(500).json([]);
    }
});

router.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Security: Don't send hashes to the frontend
        res.json(users);
    } catch (err) {
        res.status(500).json([]);
    }
});

router.post('/admin/users/delete', async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findById(id);
        if (user && user.role === 'admin') {
            return res.json({ success: false, message: "Cannot delete admin" });
        }
        await User.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;