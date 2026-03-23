const User = require('../models/User'); // 1. Use the User model we just updated
const Booking = require('../models/Booking'); // 2. Ensure you have a Booking model
const bcrypt = require('bcrypt');

// REGISTER STAFF
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

        // Create new user (Bcrypt in User.js will automatically scramble the password here)
        const newUser = new User({ name, email, password, role: 'staff' });
        await newUser.save();

        res.json({ success: true, user: { name: newUser.name, email: newUser.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LOGIN STAFF
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body; // Use email for safer login

        // 1. Find the user in MongoDB
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

        // 2. COMPARE the typed password with the encrypted hash
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// GET ALL BOOKINGS
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (err) {
        res.status(500).json([]);
    }
};

// MARK SERVICE AS COMPLETED
exports.completeService = async (req, res) => {
    try {
        // MongoDB uses _id. We update by ID.
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "COMPLETED" }, { new: true });
        if (booking) res.json({ success: true });
        else res.status(404).json({ success: false });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// PROCESS PAYMENT
exports.processPayment = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { 
            status: "PAID", 
            method: req.body.method 
        }, { new: true });
        
        if (booking) res.json({ success: true });
        else res.status(404).json({ success: false });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};