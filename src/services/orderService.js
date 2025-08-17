const API_BASE = "http://localhost:5000/order";

export const getAllOrders = async () => {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return await res.json();
};

export const markOrderAsPaid = async (id) => {
  const res = await fetch(`${API_BASE}/mark-paid/${id}`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark order as paid");
  return await res.json();
};

// Mark an order as sent
export const markOrderAsSent = async (orderId) => {
  const res = await fetch(`${API_BASE}/${orderId}/sent`, {
    method: "PATCH", // or "PUT" depending on your backend
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sentToCustomer: true }), // send the update
  });

  if (!res.ok) throw new Error("Failed to mark order as sent");
  return await res.json();
};

export const getOrderById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  return await res.json();
};

export const deleteOrder = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete order");
  return await res.json();
};
