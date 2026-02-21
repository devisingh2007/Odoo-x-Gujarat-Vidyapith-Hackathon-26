import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: false
    },
    type: {
        type: String,
        enum: ['Fuel', 'Toll', 'Maintenance', 'Other'],
        default: 'Fuel',
        required: true
    },
    liters: {
        type: Number,
        default: 0
    },
    cost: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
