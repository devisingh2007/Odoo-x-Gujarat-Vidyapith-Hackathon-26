export const sampleVehicles = [
  { id: 'v1', name: 'Truck-01', model: 'Tata 407', licensePlate: 'MH-12-AB-1234', type: 'Truck', maxCapacity: 4000, odometer: 45200, status: 'Available', region: 'North', acquiredDate: '2024-01-15', acquisitionCost: 1200000 },
  { id: 'v2', name: 'Van-05', model: 'Maruti Eeco', licensePlate: 'MH-14-CD-5678', type: 'Van', maxCapacity: 500, odometer: 32100, status: 'On Trip', region: 'South', acquiredDate: '2024-03-20', acquisitionCost: 450000 },
  { id: 'v3', name: 'Bike-02', model: 'Honda Activa', licensePlate: 'MH-01-EF-9012', type: 'Bike', maxCapacity: 20, odometer: 12500, status: 'Available', region: 'East', acquiredDate: '2024-06-10', acquisitionCost: 85000 },
  { id: 'v4', name: 'Truck-03', model: 'Ashok Leyland', licensePlate: 'MH-20-GH-3456', type: 'Truck', maxCapacity: 8000, odometer: 78900, status: 'In Shop', region: 'West', acquiredDate: '2023-08-05', acquisitionCost: 2500000 },
  { id: 'v5', name: 'Van-02', model: 'Mahindra Supro', licensePlate: 'MH-04-IJ-7890', type: 'Van', maxCapacity: 750, odometer: 21000, status: 'Available', region: 'North', acquiredDate: '2024-09-12', acquisitionCost: 600000 },
];

export const sampleDrivers = [
  { id: 'd1', name: 'Alex Kumar', phone: '9876543210', status: 'On Duty', safetyScore: 92, tripsCompleted: 145, licenseCategories: ['Truck', 'Van'], licenseExpiry: '2027-05-15', joinDate: '2022-03-10' },
  { id: 'd2', name: 'Priya Sharma', phone: '9876543211', status: 'On Duty', safetyScore: 88, tripsCompleted: 112, licenseCategories: ['Van', 'Bike'], licenseExpiry: '2026-11-20', joinDate: '2023-01-15' },
  { id: 'd3', name: 'Rahul Patel', phone: '9876543212', status: 'Off Duty', safetyScore: 75, tripsCompleted: 67, licenseCategories: ['Truck'], licenseExpiry: '2025-02-01', joinDate: '2023-06-22' },
  { id: 'd4', name: 'Meera Singh', phone: '9876543213', status: 'On Duty', safetyScore: 95, tripsCompleted: 201, licenseCategories: ['Truck', 'Van', 'Bike'], licenseExpiry: '2028-08-30', joinDate: '2021-11-05' },
  { id: 'd5', name: 'Jay Desai', phone: '9876543214', status: 'Suspended', safetyScore: 55, tripsCompleted: 34, licenseCategories: ['Van'], licenseExpiry: '2026-04-10', joinDate: '2024-02-18' },
];

export const sampleTrips = [
  { id: 't1', vehicleId: 'v2', driverId: 'd2', origin: 'Mumbai', destination: 'Pune', cargoWeight: 400, status: 'Dispatched', startOdometer: 32000, endOdometer: null, createdAt: '2026-02-20T08:00:00', completedAt: null, revenue: 15000 },
  { id: 't2', vehicleId: 'v1', driverId: 'd1', origin: 'Delhi', destination: 'Jaipur', cargoWeight: 3500, status: 'Completed', startOdometer: 44000, endOdometer: 45200, createdAt: '2026-02-18T10:00:00', completedAt: '2026-02-19T14:00:00', revenue: 45000 },
  { id: 't3', vehicleId: 'v3', driverId: 'd4', origin: 'Kolkata', destination: 'Howrah', cargoWeight: 15, status: 'Completed', startOdometer: 12200, endOdometer: 12500, createdAt: '2026-02-17T09:00:00', completedAt: '2026-02-17T12:00:00', revenue: 2000 },
  { id: 't4', vehicleId: 'v5', driverId: 'd1', origin: 'Nashik', destination: 'Nagpur', cargoWeight: 600, status: 'Completed', startOdometer: 20200, endOdometer: 21000, createdAt: '2026-02-15T07:00:00', completedAt: '2026-02-16T18:00:00', revenue: 25000 },
];

export const sampleMaintenance = [
  { id: 'm1', vehicleId: 'v4', serviceType: 'Engine Repair', description: 'Complete engine overhaul', cost: 45000, serviceDate: '2026-02-19', nextDueDate: '2026-08-19', status: 'In Progress' },
  { id: 'm2', vehicleId: 'v1', serviceType: 'Oil Change', description: 'Routine oil change and filter replacement', cost: 3500, serviceDate: '2026-02-10', nextDueDate: '2026-05-10', status: 'Completed' },
  { id: 'm3', vehicleId: 'v2', serviceType: 'Tire Rotation', description: 'All four tires rotated', cost: 2000, serviceDate: '2026-01-25', nextDueDate: '2026-07-25', status: 'Completed' },
];

export const sampleExpenses = [
  { id: 'e1', vehicleId: 'v1', tripId: 't2', type: 'Fuel', liters: 120, cost: 12000, date: '2026-02-18' },
  { id: 'e2', vehicleId: 'v2', tripId: 't1', type: 'Fuel', liters: 45, cost: 4500, date: '2026-02-20' },
  { id: 'e3', vehicleId: 'v3', tripId: 't3', type: 'Fuel', liters: 5, cost: 500, date: '2026-02-17' },
  { id: 'e4', vehicleId: 'v5', tripId: 't4', type: 'Fuel', liters: 80, cost: 8000, date: '2026-02-15' },
  { id: 'e5', vehicleId: 'v1', tripId: null, type: 'Toll', liters: 0, cost: 1500, date: '2026-02-18' },
  { id: 'e6', vehicleId: 'v5', tripId: null, type: 'Toll', liters: 0, cost: 800, date: '2026-02-16' },
];

export const sampleUsers = [
  { id: 'u1', name: 'Admin Manager', email: 'manager@fleetflow.com', password: 'manager123', role: 'Manager' },
  { id: 'u2', name: 'Dispatch Lead', email: 'dispatch@fleetflow.com', password: 'dispatch123', role: 'Dispatcher' },
  { id: 'u3', name: 'Safety Head', email: 'safety@fleetflow.com', password: 'safety123', role: 'Safety Officer' },
  { id: 'u4', name: 'Finance Lead', email: 'finance@fleetflow.com', password: 'finance123', role: 'Financial Analyst' },
];
