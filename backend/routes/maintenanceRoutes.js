import express from 'express';
import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';
import { auth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all maintenance records
router.get('/', auth, async (req, res) => {
    try {
        const records = await Maintenance.find().populate('vehicleId');
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Log a new maintenance record
router.post('/', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    const record = new Maintenance(req.body);
    try {
        // Set vehicle to 'In Shop'
        await Vehicle.findByIdAndUpdate(req.body.vehicleId, { status: 'In Shop' });

        const newRecord = await record.save();
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Complete a maintenance record
router.patch('/:id/complete', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    try {
        const record = await Maintenance.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        record.status = 'Completed';
        await record.save();

        // Reset vehicle status to 'Available'
        await Vehicle.findByIdAndUpdate(record.vehicleId, { status: 'Available' });

        res.json(record);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
