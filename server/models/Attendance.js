const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    date: { type: String, required: true }, 
    clockIn: { type: String },
    clockOut: { type: String }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);