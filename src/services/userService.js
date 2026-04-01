import { fetchJson } from "./apiClient";

// Get all customers
export const getAllCustomers = async () => {
  return fetchJson("/user");
};

// Get customer by ID
export const getCustomerById = async (id) => {
  return fetchJson(`/user/${id}`);
};

// Update customer
export const updateCustomer = async (id, updatedData) => {
  return fetchJson(`/user/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
};

// Delete customer
export const deleteCustomer = async (id) => {
  return fetchJson(`/user/${id}`, {
    method: "DELETE",
  });
};
