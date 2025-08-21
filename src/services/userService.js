// const API_URL = "http://localhost:5000/user";
const API_URL = "https://ayini-backend.onrender.com/user";

// Get all customers
export const getAllCustomers = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch customers");
  return await response.json();
};

// Get customer by ID
export const getCustomerById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Failed to fetch customer");
  return await response.json();
};

// Update customer
export const updateCustomer = async (id, updatedData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) throw new Error("Failed to update customer");
  return await response.json();
};

// Delete customer
export const deleteCustomer = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete customer");
  return await response.json();
};
