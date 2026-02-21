import express from 'express';
import Expense from '../models/Expense.js';
import { auth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all expenses
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expense.find()
            .populate('vehicleId', 'name licensePlate')
            .populate('tripId', 'origin destination')
            .sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add high-level aggregation or summary here if needed for analytics
router.get('/summary', auth, async (req, res) => {
    try {
        const summary = await Expense.aggregate([
            {
                $group: {
                    _id: "$type",
                    totalCost: { $sum: "$cost" },
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new expense
router.post('/', auth, authorize(['Manager', 'Financial Analyst', 'Admin']), async (req, res) => {
    try {
        const newExpense = new Expense(req.body);
        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete expense
router.delete('/:id', auth, authorize(['Manager', 'Admin']), async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
