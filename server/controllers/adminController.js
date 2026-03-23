const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');

// --- AUTH API ---

// Login (MongoDB + Bcrypt Encryption)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user in MongoDB (by name or email)
        const user = await User.findOne({ 
            $or: [{ name: username }, { email: username }] 
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        // Compare encrypted password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.json({ 
                success: true, 
                user: { id: user._id, name: user.name, role: user.role } 
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid password" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Register (Automatic Encryption via User.js pre-save hook)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.json({ success: false, message: "User already exists" });

        const newUser = new User({ name, email, password, role: 'staff' });
        await newUser.save(); // The encryption happens in User.js automatically
        
        res.json({ success: true, user: newUser });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- BOOKINGS API ---

router.get('/bookings', async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings);
});

router.post('/bookings', async (req, res) => {
    try {
        const newBooking = new Booking({
            ...req.body,
            status: 'PENDING'
        });
        await newBooking.save();
        res.json({ success: true, booking: newBooking });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Update Booking (Complete / Pay)
router.put('/bookings/:id/:action', async (req, res) => {
    try {
        const { id, action } = req.params;
        const { method, staffId, staffName } = req.body;
        
        let updateData = {};
        if (action === 'complete') updateData.status = 'COMPLETED';
        if (action === 'pay') {
            updateData.status = 'PAID';
            updateData.method = method;
            updateData.staffId = staffId;
            updateData.staffName = staffName;
        }

        const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
        if (booking) res.json({ success: true });
        else res.status(404).json({ success: false });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// --- ATTENDANCE API ---

router.post('/attendance', async (req, res) => {
    const { staffId, staffName, type, time } = req.body;

    if (type === 'CLOCK_IN') {
        const newRecord = new Attendance({
            staffId,
            staffName,
            date: new Date().toDateString(),
            clockIn: new Date(time).toLocaleTimeString(),
            clockOut: null
        });
        await newRecord.save();
    } else if (type === 'CLOCK_OUT') {
        const record = await Attendance.findOne({ staffId, clockOut: null }).sort({ _id: -1 });
        if (record) {
            record.clockOut = new Date(time).toLocaleTimeString();
            await record.save();
        }
    }
    res.json({ success: true });
});

module.exports = router;