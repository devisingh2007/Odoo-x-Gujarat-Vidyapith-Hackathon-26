import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('admin123', 12);

        const users = [
            { name: 'Fleet Manager', email: 'admin@fleet.com', password: hashedPassword, role: 'Admin' },
            { name: 'Logistic Dispatcher', email: 'dispatcher@fleet.com', password: hashedPassword, role: 'Dispatcher' },
            { name: 'Safety Officer', email: 'safety@fleet.com', password: hashedPassword, role: 'Safety Officer' },
            { name: 'Financial Analyst', email: 'analyst@fleet.com', password: hashedPassword, role: 'Financial Analyst' }
        ];

        for (const userData of users) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                await new User(userData).save();
                console.log(`Seeded: ${userData.role} (${userData.email})`);
            } else {
                console.log(`Skipped: ${userData.role} already exists`);
            }
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();
