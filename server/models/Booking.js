const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    client: { type: String, required: true },
    phone: { type: String },
    service: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'PAID'], default: 'PENDING' },
    method: { type: String, enum: ['CASH', 'WALLET', null] },
    staffId: { type: String },
    staffName: { type: String },
    date: { type: Date, default: Date.now }
});

// THE FIX: This tells Mongoose to include 'id' (which frontend expects) 
// whenever it sends data to the dashboard.
BookingSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id.toString(); // Creates 'id' from '_id'
        return ret;
    }
});

module.exports = mongoose.model('Booking', BookingSchema);