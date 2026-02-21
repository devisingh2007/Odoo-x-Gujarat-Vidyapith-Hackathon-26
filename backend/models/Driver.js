import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    licenseCategories: [{ type: String, enum: ['Truck', 'Van', 'Bike'] }],
    licenseExpiry: { type: Date, required: true },
    safetyScore: { type: Number, min: 0, max: 100, default: 85 },
    status: { type: String, enum: ['On Duty', 'Off Duty', 'On Trip', 'Suspended'], default: 'On Duty' },
    tripsCompleted: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);
