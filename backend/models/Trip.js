import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    cargoWeight: { type: Number, required: true },
    revenue: { type: Number, default: 0 },
    startOdometer: { type: Number, required: true },
    endOdometer: { type: Number },
    status: { type: String, enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'], default: 'Draft' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);
