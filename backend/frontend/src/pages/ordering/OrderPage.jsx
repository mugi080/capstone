import React, { useState, useEffect } from "react";
import { fetchOrders } from "../../api/Order"; // Import the fetch function

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <div>
      <h1>Your Orders</h1>
      {loading ? <p>Loading...</p> : error ? <p>{error}</p> : orders.length === 0 ? <p>No orders yet.</p> : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <h2>Order ID: {order.id}</h2>
              <p>Total Price: Php {order.total_price}</p>
              <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.beverage.name} - {item.quantity}x - Php {item.total_price}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;
