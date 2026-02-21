import express from 'express';
import Vehicle from '../models/Vehicle.js';
import { auth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all vehicles
router.get('/', auth, async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new vehicle
router.post('/', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    const vehicle = new Vehicle(req.body);
    try {
        const newVehicle = await vehicle.save();
        res.status(201).json(newVehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a vehicle
router.patch('/:id', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a vehicle
router.delete('/:id', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
