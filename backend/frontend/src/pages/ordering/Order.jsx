import React, { useState, useEffect } from "react";
import { fetchOrders } from "../../api/Order";
import { updateOrder } from "../../api/UpdateDelete";
import { deleteOrder } from "../../api/UpdateDelete";
import "./Order.css";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [newItems, setNewItems] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const fetchedOrders = await fetchOrders();
        if (fetchedOrders.success) {
          setOrders(fetchedOrders.data);
        } else {
          setError(fetchedOrders.message);
        }
      } catch (error) {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await deleteOrder(orderId);
      if (response.success) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
        alert("Order has been cancelled!");
      } else {
        throw new Error("Failed to cancel order.");
      }
    } catch (error) {
      alert("Error cancelling order.");
    }
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      const updatedOrder = await updateOrder(orderId, newItems);
      if (updatedOrder.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, items: updatedOrder.orderDetails.items }
              : order
          )
        );
        setEditingOrder(null);
        alert("Order updated successfully!");
      } else {
        alert("Failed to update the order.");
      }
    } catch (error) {
      alert("Error updating order.");
    }
  };

  const handleChangeItemQuantity = (itemId, newQuantity) => {
    setNewItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: parseInt(newQuantity, 10) }
          : item
      )
    );
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    // Format items for backend (only id, beverage ID, and quantity)
    setNewItems(
      order.items.map((item) => ({
        id: item.id,
        beverage: item.beverage.id,
        quantity: item.quantity,
      }))
    );
  };

  return (
    <div className="orders-page p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="order-list grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div className="order-card bg-white p-4 rounded-lg shadow-lg" key={order.id}>
              <h2 className="order-id text-xl font-bold mb-2">Order ID: {order.id}</h2>
              <p className="order-date text-sm text-gray-600">
                Date: {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p className="total-price text-lg font-semibold mt-2">
                Total Price: Php {order.total_price}
              </p>

              <div className="items mt-4">
                <h3 className="font-semibold text-lg">Items Ordered:</h3>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="item flex justify-between">
                      <span className="item-name">{item.beverage.name}</span>
                      <span className="item-quantity">{item.quantity}x</span>
                      <span className="item-price">Php {item.total_price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-info mt-4">
                <p className="font-semibold">Address:</p>
                <p>{order.address}</p>

                <p className="font-semibold mt-2">Payment Method:</p>
                <p>{order.payment_method}</p>
              </div>

              <div className="buttons mt-4 flex justify-between">
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to cancel this order?")) {
                      handleCancelOrder(order.id);
                    }
                  }}
                  className="cancel-order-btn bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Cancel Order
                </button>

                {/* <button
                  onClick={() => handleEditOrder(order)}
                  className="update-order-btn bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Edit Order
                </button> */}
              </div>

              {editingOrder && editingOrder.id === order.id && (
                <div className="edit-order-form mt-4">
                  <h3>Edit Order</h3>
                  {newItems.map((item, index) => (
                    <div key={index} className="edit-item flex items-center justify-between mb-2">
                      <label>Item ID {item.beverage}</label>
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={(e) =>
                          handleChangeItemQuantity(item.id, e.target.value)
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => handleUpdateOrder(order.id)}
                    className="submit-update-btn bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Update Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;
