const API_BASE = "http://localhost:5000/order";

export const getAllOrders = async () => {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch orders");
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
