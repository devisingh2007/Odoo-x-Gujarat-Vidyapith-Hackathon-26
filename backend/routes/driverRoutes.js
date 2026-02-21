import express from 'express';
import Driver from '../models/Driver.js';
import { auth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all drivers
router.get('/', auth, async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new driver
router.post('/', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    const driver = new Driver(req.body);
    try {
        const newDriver = await driver.save();
        res.status(201).json(newDriver);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a driver
router.patch('/:id', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a driver
router.delete('/:id', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json({ message: 'Driver deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
