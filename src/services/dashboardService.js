// services/dashboardService.js
import axios from "axios";
const API_URL = "http://localhost:5000";
// const API_URL = "https://ayini-backend.onrender.com";

export const fetchDashboardOverview = async () => {
    const response = await fetch(`${API_URL}/dashboard`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const getRecentOrders = async () => {
    const response = await fetch(`${API_URL}/dashboard/recent-orders`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const getRecentPayments  = async () => {
    const response = await fetch(`${API_URL}/dashboard/recent-payments`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const getSalesAnalytics = async () => {
    const response = await fetch(`${API_URL}/dashboard/sales-analytics`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
  };

