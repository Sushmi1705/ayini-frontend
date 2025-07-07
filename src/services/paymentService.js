const BASE_URL = "http://localhost:5000/adminPayment";

export const getAllPayments = async () => {
  const response = await fetch(BASE_URL);
  if (!response.ok) throw new Error("Failed to fetch payments");
  return await response.json();
};

export const getPaymentById = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error("Failed to fetch payment by ID");
  return await response.json();
};

export const filterPaymentsByStatus = async (status) => {
  const response = await fetch(`${BASE_URL}?status=${status}`);
  if (!response.ok) throw new Error("Failed to filter payments by status");
  return await response.json();
};

export const filterPaymentsById = async (id) => {
  const response = await fetch(`${BASE_URL}?id=${id}`);
  if (!response.ok) throw new Error("Failed to filter payments by ID");
  return await response.json();
};

export const filterPaymentsByDateRange = async (from, to) => {
  const response = await fetch(`${BASE_URL}?from=${from}&to=${to}`);
  if (!response.ok) throw new Error("Failed to filter payments by date range");
  return await response.json();
};

export const filterPaymentsByAll = async ({ status, from, to }) => {
  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);
  if (from) queryParams.append("from", from);
  if (to) queryParams.append("to", to);

  const response = await fetch(`${BASE_URL}?${queryParams.toString()}`);
  if (!response.ok) throw new Error("Failed to filter payments");
  return await response.json();
};
