import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Truck', 'Van', 'Bike'], default: 'Truck' },
    maxCapacity: { type: Number, required: true },
    odometer: { type: Number, required: true, default: 0 },
    region: { type: String, enum: ['North', 'South', 'East', 'West'], default: 'North' },
    acquisitionCost: { type: Number },
    status: { type: String, enum: ['Available', 'Retired', 'In Shop', 'On Trip'], default: 'Available' },
    acquiredDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
