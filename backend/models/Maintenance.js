import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceType: { type: String, required: true },
    description: { type: String },
    cost: { type: Number, required: true },
    serviceDate: { type: Date, required: true },
    nextDueDate: { type: Date },
    status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' }
}, { timestamps: true });

export default mongoose.model('Maintenance', maintenanceSchema);
