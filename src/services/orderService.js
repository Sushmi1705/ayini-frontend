import { fetchJson } from "./apiClient";

export const getAllOrders = async () => {
  return fetchJson("/order");
};

export const getOrdersByUserId = async (userId) => {
  try {
    return await fetchJson(`/order/user/${userId}`);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const markOrderAsPaid = async (id) => {
  return fetchJson(`/order/mark-paid/${id}`, { method: "PUT" });
};

// Mark an order as sent
export const markOrderAsSent = async (orderId) => {
  return fetchJson(`/order/${orderId}/sent`, {
    method: "PATCH", // or "PUT" depending on your backend
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sentToCustomer: true }), // send the update
  });
};

export const getOrderById = async (id) => {
  return fetchJson(`/order/${id}`);
};

export const deleteOrder = async (id) => {
  return fetchJson(`/order/${id}`, {
    method: "DELETE",
  });
};
