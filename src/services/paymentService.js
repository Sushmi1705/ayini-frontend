import { fetchJson } from "./apiClient";

export const getAllPayments = async () => {
  return fetchJson("/adminPayment");
};

export const getPaymentById = async (id) => {
  return fetchJson(`/adminPayment/${id}`);
};

export const filterPaymentsByStatus = async (status) => {
  return fetchJson(`/adminPayment?status=${status}`);
};

export const filterPaymentsById = async (id) => {
  return fetchJson(`/adminPayment?id=${id}`);
};

export const filterPaymentsByDateRange = async (from, to) => {
  return fetchJson(`/adminPayment?from=${from}&to=${to}`);
};

export const filterPaymentsByAll = async ({ status, from, to }) => {
  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);
  if (from) queryParams.append("from", from);
  if (to) queryParams.append("to", to);

  return fetchJson(`/adminPayment?${queryParams.toString()}`);
};
