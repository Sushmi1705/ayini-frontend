import { fetchJson } from "./apiClient";

export const fetchDashboardOverview = async () => {
    return fetchJson("/dashboard");
};

export const getRecentOrders = async () => {
    return fetchJson("/dashboard/recent-orders");
};

export const getRecentPayments  = async () => {
    return fetchJson("/dashboard/recent-payments");
};

export const getSalesAnalytics = async () => {
    return fetchJson("/dashboard/sales-analytics");
  };
