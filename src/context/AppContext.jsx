import { createContext, useContext, useReducer, useEffect } from 'react';
// Optimized state management and persistence logic

import { sampleVehicles, sampleDrivers, sampleTrips, sampleMaintenance, sampleExpenses, sampleUsers } from '../data/sampleData';

const AppContext = createContext();

const loadState = () => {
    try {
        const saved = localStorage.getItem('fleetflow_state');
        if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return null;
};

const initialState = loadState() || {
    auth: { user: null, isAuthenticated: false },
    vehicles: sampleVehicles,
    drivers: sampleDrivers,
    trips: sampleTrips,
    maintenance: sampleMaintenance,
    expenses: sampleExpenses,
    users: sampleUsers,
};

function appReducer(state, action) {
    switch (action.type) {

        // AUTH
        case 'LOGIN': {
            const user = state.users.find(u => u.email === action.payload.email && u.password === action.payload.password);
            if (!user) return state;
            return { ...state, auth: { user, isAuthenticated: true } };
        }
        case 'LOGOUT':
            return { ...state, auth: { user: null, isAuthenticated: false } };

        // VEHICLES
        case 'ADD_VEHICLE':
            return { ...state, vehicles: [...state.vehicles, { ...action.payload, id: 'v' + Date.now() }] };
        case 'UPDATE_VEHICLE':
            return { ...state, vehicles: state.vehicles.map(v => v.id === action.payload.id ? { ...v, ...action.payload } : v) };
        case 'DELETE_VEHICLE':
            return { ...state, vehicles: state.vehicles.filter(v => v.id !== action.payload) };
        case 'SET_VEHICLE_STATUS':
            return { ...state, vehicles: state.vehicles.map(v => v.id === action.payload.id ? { ...v, status: action.payload.status } : v) };

        // DRIVERS
        case 'ADD_DRIVER':
            return { ...state, drivers: [...state.drivers, { ...action.payload, id: 'd' + Date.now() }] };
        case 'UPDATE_DRIVER':
            return { ...state, drivers: state.drivers.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d) };
        case 'DELETE_DRIVER':
            return { ...state, drivers: state.drivers.filter(d => d.id !== action.payload) };
        case 'SET_DRIVER_STATUS':
            return { ...state, drivers: state.drivers.map(d => d.id === action.payload.id ? { ...d, status: action.payload.status } : d) };

        // TRIPS
        case 'CREATE_TRIP': {
            const newTrip = { ...action.payload, id: 't' + Date.now(), status: 'Draft', createdAt: new Date().toISOString(), completedAt: null };
            return { ...state, trips: [...state.trips, newTrip] };
        }
        case 'DISPATCH_TRIP': {
            const trip = state.trips.find(t => t.id === action.payload);
            if (!trip) return state;
            return {
                ...state,
                trips: state.trips.map(t => t.id === action.payload ? { ...t, status: 'Dispatched' } : t),
                vehicles: state.vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v),
                drivers: state.drivers.map(d => d.id === trip.driverId ? { ...d, status: 'On Trip' } : d),
            };
        }
        case 'COMPLETE_TRIP': {
            const trip = state.trips.find(t => t.id === action.payload.tripId);
            if (!trip) return state;
            return {
                ...state,
                trips: state.trips.map(t => t.id === action.payload.tripId ? { ...t, status: 'Completed', endOdometer: action.payload.endOdometer, completedAt: new Date().toISOString() } : t),
                vehicles: state.vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available', odometer: action.payload.endOdometer } : v),
                drivers: state.drivers.map(d => d.id === trip.driverId ? { ...d, status: 'On Duty', tripsCompleted: d.tripsCompleted + 1 } : d),
            };
        }
        case 'CANCEL_TRIP': {
            const trip = state.trips.find(t => t.id === action.payload);
            if (!trip) return state;
            const updates = { trips: state.trips.map(t => t.id === action.payload ? { ...t, status: 'Cancelled' } : t) };
            if (trip.status === 'Dispatched') {
                updates.vehicles = state.vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' } : v);
                updates.drivers = state.drivers.map(d => d.id === trip.driverId ? { ...d, status: 'On Duty' } : d);
            }
            return { ...state, ...updates };
        }

        // MAINTENANCE
        case 'ADD_MAINTENANCE':
            return {
                ...state,
                maintenance: [...state.maintenance, { ...action.payload, id: 'm' + Date.now(), status: 'In Progress' }],
                vehicles: state.vehicles.map(v => v.id === action.payload.vehicleId ? { ...v, status: 'In Shop' } : v),
            };
        case 'COMPLETE_MAINTENANCE':
            return {
                ...state,
                maintenance: state.maintenance.map(m => m.id === action.payload.id ? { ...m, status: 'Completed' } : m),
                vehicles: state.vehicles.map(v => v.id === action.payload.vehicleId ? { ...v, status: 'Available' } : v),
            };

        // EXPENSES
        case 'ADD_EXPENSE':
            return { ...state, expenses: [...state.expenses, { ...action.payload, id: 'e' + Date.now() }] };
        case 'DELETE_EXPENSE':
            return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };

        case 'RESET_DATA':
            return { ...initialState, auth: state.auth };

        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        localStorage.setItem('fleetflow_state', JSON.stringify(state));
    }, [state]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}

export default AppContext;
