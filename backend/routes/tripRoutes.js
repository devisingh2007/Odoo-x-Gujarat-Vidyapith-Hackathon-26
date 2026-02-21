import express from 'express';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import { auth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all trips (populated with vehicle and driver info)
router.get('/', auth, async (req, res) => {
    try {
        const trips = await Trip.find().populate('vehicleId').populate('driverId');
        res.json(trips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new trip
router.post('/', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    const trip = new Trip(req.body);
    try {
        // Basic logic to update vehicle and driver status
        await Vehicle.findByIdAndUpdate(req.body.vehicleId, { status: 'On Trip' });
        await Driver.findByIdAndUpdate(req.body.driverId, { status: 'On Trip' });

        const newTrip = await trip.save();
        res.status(201).json(newTrip);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Dispatch a trip
router.patch('/:id/dispatch', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    try {
        const trip = await Trip.findByIdAndUpdate(req.params.id, { status: 'Dispatched' }, { new: true });
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json(trip);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Complete a trip
router.patch('/:id/complete', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        trip.status = 'Completed';
        trip.endOdometer = req.body.endOdometer;
        trip.endDate = Date.now();
        await trip.save();

        // Reset vehicle and driver status
        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'Available', odometer: req.body.endOdometer });
        await Driver.findByIdAndUpdate(trip.driverId, { status: 'On Duty', $inc: { tripsCompleted: 1 } });

        res.json(trip);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Cancel a trip
router.patch('/:id/cancel', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        trip.status = 'Cancelled';
        await trip.save();

        // Reset vehicle and driver status
        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'Available' });
        await Driver.findByIdAndUpdate(trip.driverId, { status: 'On Duty' });

        res.json(trip);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
