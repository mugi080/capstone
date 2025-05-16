import React, { useEffect, useState } from "react";
import axios from "axios";

const Logistics = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);

  // Fetch orders based on status filter
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/orders/?status=${filterStatus}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/orders/${orderId}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? response.data : order))
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  return (
    <div className="logistics-container">
      <h2>Logistics Dashboard</h2>

      {/* Status Filter */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="status-filter">Filter Orders by Status:</label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="In Transit">In Transit</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Order Table */}
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table className="logistics-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Contact</th>
              <th>Delivery Type</th>
              <th>Status</th>
              <th>Assigned Staff</th>
              <th>Assigned Vehicle</th>
              <th>Address</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer_name || "N/A"}</td>
                  <td>{order.contact_number || "N/A"}</td>
                  <td>{order.delivery_type}</td>
                  <td>{order.status}</td>
                  <td>{order.assigned_staff?.username || "Unassigned"}</td>
                  <td>{order.assigned_vehicle?.name || "Unassigned"}</td>
                  <td>{order.address || "N/A"}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Logistics;