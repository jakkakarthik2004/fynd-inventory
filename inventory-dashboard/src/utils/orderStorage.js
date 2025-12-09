export const ORDER_STORAGE_KEY = 'inventory_dashboard_orders';

export function getOrders() {
  try {
    const orders = localStorage.getItem(ORDER_STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
  } catch (e) {
    console.error("Failed to parse orders", e);
    return [];
  }
}

export function saveOrder(order) {
  const orders = getOrders();
  const newOrder = {
    ...order,
    id: Date.now(), // simple ID
    date_placed: new Date().toISOString().split('T')[0],
    status: 'PLACED'
  };
  orders.unshift(newOrder);
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  return newOrder;
}
