import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Vehicle from './models/Vehicle.js';
import Driver from './models/Driver.js';
import Trip from './models/Trip.js';
import Maintenance from './models/Maintenance.js';
import Expense from './models/Expense.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing operational data (optional, but good for a clean seed)
        // Keep the Admin user by not clearing User model
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});
        await Trip.deleteMany({});
        await Maintenance.deleteMany({});
        await Expense.deleteMany({});
        console.log('Existing data cleared');

        // 1. Seed Vehicles
        const vehicles = await Vehicle.insertMany([
            { name: 'Bharat Express 01', model: 'Tata Prima', licensePlate: 'MH-12-PQ-1234', type: 'Truck', maxCapacity: 15000, odometer: 45000, region: 'West', acquisitionCost: 3500000, status: 'Available' },
            { name: 'Deccan Cargo 05', model: 'Tata Ultra', licensePlate: 'MH-14-RT-5678', type: 'Truck', maxCapacity: 10000, odometer: 12000, region: 'West', acquisitionCost: 2800000, status: 'On Trip' },
            { name: 'North Cargo 12', model: 'Mahindra Blazo', licensePlate: 'DL-01-AB-1122', type: 'Truck', maxCapacity: 18000, odometer: 68000, region: 'North', acquisitionCost: 4200000, status: 'Available' },
            { name: 'South Swift 03', model: 'Leyland Stalion', licensePlate: 'TN-05-XY-9988', type: 'Truck', maxCapacity: 12000, odometer: 32000, region: 'South', acquisitionCost: 3100000, status: 'Available' },
            { name: 'City Sprint 22', model: 'Ashok Leyland Dost', licensePlate: 'KA-03-MN-4455', type: 'Van', maxCapacity: 3500, odometer: 8500, region: 'South', acquisitionCost: 1200000, status: 'In Shop' },
            { name: 'Rapid Delivery 09', model: 'Maruti Suzuki Super Carry', licensePlate: 'GJ-01-JK-7766', type: 'Van', maxCapacity: 2500, odometer: 15000, region: 'West', acquisitionCost: 850000, status: 'Available' },
            { name: 'Hyper Fast 07', model: 'Hero Splendor Cargo', licensePlate: 'MH-15-TY-3344', type: 'Bike', maxCapacity: 150, odometer: 2500, region: 'West', acquisitionCost: 95000, status: 'Available' },
        ]);
        console.log('Vehicles seeded');

        // 2. Seed Drivers
        const drivers = await Driver.insertMany([
            { name: 'Rajesh Kumar', phone: '9876543210', licenseCategories: ['Truck', 'Van'], licenseExpiry: '2028-12-31', safetyScore: 92, status: 'On Duty', tripsCompleted: 45 },
            { name: 'Suresh Patil', phone: '9822113344', licenseCategories: ['Truck'], licenseExpiry: '2027-05-15', safetyScore: 88, status: 'On Trip', tripsCompleted: 120 },
            { name: 'Amit Singh', phone: '9900887766', licenseCategories: ['Van', 'Truck'], licenseExpiry: '2026-11-20', safetyScore: 95, status: 'On Duty', tripsCompleted: 12 },
            { name: 'Vijay Pawar', phone: '9766554433', licenseCategories: ['Van', 'Bike'], licenseExpiry: '2025-02-10', safetyScore: 78, status: 'On Duty', tripsCompleted: 210 }, // License expiring soon
            { name: 'Kushal Das', phone: '9544332211', licenseCategories: ['Bike'], licenseExpiry: '2029-08-30', safetyScore: 90, status: 'On Duty', tripsCompleted: 35 },
            { name: 'Rohan Sharma', phone: '9122334455', licenseCategories: ['Truck'], licenseExpiry: '2024-01-01', safetyScore: 82, status: 'Suspended', tripsCompleted: 5 }, // License expired/Suspended
        ]);
        console.log('Drivers seeded');

        // 3. Seed Trips (Mix of Completed, Dispatched, and Draft)
        const completedTrips = await Trip.insertMany([
            {
                vehicleId: vehicles[0]._id, driverId: drivers[0]._id, origin: 'Mumbai', destination: 'Pune',
                cargoWeight: 12000, revenue: 15000, startOdometer: 44600, endOdometer: 44800, status: 'Completed',
                startDate: '2024-02-15', endDate: '2024-02-16'
            },
            {
                vehicleId: vehicles[2]._id, driverId: drivers[1]._id, origin: 'Delhi', destination: 'Agra',
                cargoWeight: 15000, revenue: 22000, startOdometer: 67500, endOdometer: 67800, status: 'Completed',
                startDate: '2024-02-18', endDate: '2024-02-19'
            },
            {
                vehicleId: vehicles[3]._id, driverId: drivers[2]._id, origin: 'Bangalore', destination: 'Chennai',
                cargoWeight: 9000, revenue: 18000, startOdometer: 31500, endOdometer: 31850, status: 'Completed',
                startDate: '2024-02-10', endDate: '2024-02-11'
            },
        ]);

        const activeTrip = await Trip.create({
            vehicleId: vehicles[1]._id, driverId: drivers[1]._id, origin: 'Nashik', destination: 'Surat',
            cargoWeight: 8500, revenue: 12000, startOdometer: 12000, status: 'Dispatched',
            startDate: new Date()
        });

        const draftTrip = await Trip.create({
            vehicleId: vehicles[0]._id, driverId: drivers[0]._id, origin: 'Nagpur', destination: 'Aurangabad',
            cargoWeight: 14000, revenue: 25000, startOdometer: 45000, status: 'Draft'
        });
        console.log('Trips seeded');

        // 4. Seed Expenses (Fuel and Tolls linked to trips and vehicles)
        await Expense.insertMany([
            { vehicleId: vehicles[0]._id, tripId: completedTrips[0]._id, type: 'Fuel', liters: 120, cost: 11500, date: '2024-02-15' },
            { vehicleId: vehicles[0]._id, tripId: completedTrips[0]._id, type: 'Toll', cost: 1200, date: '2024-02-15' },
            { vehicleId: vehicles[2]._id, tripId: completedTrips[1]._id, type: 'Fuel', liters: 180, cost: 17200, date: '2024-02-18' },
            { vehicleId: vehicles[2]._id, tripId: completedTrips[1]._id, type: 'Toll', cost: 2500, date: '2024-02-18' },
            { vehicleId: vehicles[3]._id, tripId: completedTrips[2]._id, type: 'Fuel', liters: 150, cost: 14400, date: '2024-02-10' },
            { vehicleId: vehicles[1]._id, tripId: activeTrip._id, type: 'Fuel', liters: 80, cost: 7600, date: new Date() },
            { vehicleId: vehicles[4]._id, type: 'Other', cost: 500, date: '2024-02-20' }, // Expense not linked to trip
        ]);
        console.log('Expenses seeded');

        // 5. Seed Maintenance
        await Maintenance.insertMany([
            { vehicleId: vehicles[4]._id, serviceType: 'Oil Change', description: 'Scheduled maintenance', cost: 12000, serviceDate: '2024-02-20', nextDueDate: '2024-08-20', status: 'In Progress' },
            { vehicleId: vehicles[0]._id, serviceType: 'Tire Rotation', description: 'Preventive care', cost: 8500, serviceDate: '2024-01-15', nextDueDate: '2024-07-15', status: 'Completed' },
        ]);
        console.log('Maintenance seeded');

        console.log('Database seeding complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
