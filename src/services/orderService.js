
const API_URL = "http://localhost:5000/order";
// const API_URL = "https://ayini-backend.onrender.com/order";

export const getAllOrders = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return await res.json();
};

export const getOrdersByUserId = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return await response.json(); // expected array of orders
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const markOrderAsPaid = async (id) => {
  const res = await fetch(`${API_URL}/mark-paid/${id}`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark order as paid");
  return await res.json();
};

// Mark an order as sent
export const markOrderAsSent = async (orderId) => {
  const res = await fetch(`${API_URL}/${orderId}/sent`, {
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
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  return await res.json();
};

export const deleteOrder = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete order");
  return await res.json();
};
