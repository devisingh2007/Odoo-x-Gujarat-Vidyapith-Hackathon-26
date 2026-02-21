import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

/* eslint-disable react-refresh/only-export-components */
const AppContext = createContext();

const API_BASE_URL = '/api';

const initialState = {
    auth: {
        user: JSON.parse(localStorage.getItem('fleetflow_user')) || null,
        isAuthenticated: !!localStorage.getItem('fleetflow_token'),
        token: localStorage.getItem('fleetflow_token') || null
    },
    vehicles: [],
    drivers: [],
    trips: [],
    maintenance: [],
    expenses: [], // Assuming expenses might be added later to backend
    loading: true,
    error: null
};

function appReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_INITIAL_DATA':
            return {
                ...state,
                vehicles: action.payload.vehicles,
                drivers: action.payload.drivers,
                trips: action.payload.trips,
                maintenance: action.payload.maintenance,
                expenses: action.payload.expenses || [],
                loading: false
            };
        case 'LOGIN':
            localStorage.setItem('fleetflow_token', action.payload.token);
            localStorage.setItem('fleetflow_user', JSON.stringify(action.payload.user));
            return {
                ...state,
                auth: { user: action.payload.user, isAuthenticated: true, token: action.payload.token }
            };
        case 'LOGOUT':
            localStorage.removeItem('fleetflow_token');
            localStorage.removeItem('fleetflow_user');
            return { ...state, auth: { user: null, isAuthenticated: false, token: null } };

        // Resource Sync (Generic updates after API success)
        case 'UPDATE_VEHICLES': return { ...state, vehicles: action.payload };
        case 'UPDATE_DRIVERS': return { ...state, drivers: action.payload };
        case 'UPDATE_TRIPS': return { ...state, trips: action.payload };
        case 'UPDATE_MAINTENANCE': return { ...state, maintenance: action.payload };

        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const fetchData = useCallback(async () => {
        if (!state.auth.isAuthenticated) {
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...(state.auth.token && { 'x-auth-token': state.auth.token })
            };

            const endpoints = ['vehicles', 'drivers', 'trips', 'maintenance', 'expenses'];
            const results = await Promise.all(
                endpoints.map(ep => fetch(`${API_BASE_URL}/${ep}`, { headers }).then(async res => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || `Failed to fetch ${ep}`);
                    return data;
                }))
            );

            const [vehicles, drivers, trips, maintenance, expenses] = results;

            dispatch({
                type: 'SET_INITIAL_DATA',
                payload: {
                    vehicles: Array.isArray(vehicles) ? vehicles : [],
                    drivers: Array.isArray(drivers) ? drivers : [],
                    trips: Array.isArray(trips) ? trips : [],
                    maintenance: Array.isArray(maintenance) ? maintenance : [],
                    expenses: Array.isArray(expenses) ? expenses : []
                }
            });
        } catch (err) {
            console.error('Fetch Error:', err);
            dispatch({ type: 'SET_ERROR', payload: err.message });
        }
    }, [state.auth.isAuthenticated, state.auth.token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Helper for API calls with Auth
    const apiCall = async (endpoint, method = 'GET', body = null) => {
        const headers = {
            'Content-Type': 'application/json',
            ...(state.auth.token && { 'x-auth-token': state.auth.token })
        };
        const config = { method, headers, ...(body && { body: JSON.stringify(body) }) };
        const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Something went wrong');
        return data;
    };

    return (
        <AppContext.Provider value={{ state, dispatch, apiCall, refreshData: fetchData }}>
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
