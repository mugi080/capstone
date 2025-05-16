import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [popup, setPopup] = useState({ message: '', type: '' }); // success or error

  const ORDER_STATUS_CHOICES = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'In Transit', label: 'In Transit' },
    { value: 'Completed', label: 'Completed' },
  ];

  const fetchOrders = async () => {
    const token = localStorage.getItem('admin_token');

    if (!token) {
      setError('You are not authorized. Please log in.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/admin/orders/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      setError('Failed to fetch orders. Please try again later.');
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query) {
      const filtered = orders.filter(
        (order) =>
          order.customer_name?.toLowerCase().includes(query) ||
          order.id.toString().includes(query)
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.patch(
        `http://localhost:8000/api/orders/${orderId}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update local state
      const updatedOrders = filteredOrders.map((order) =>
        order.id === orderId ? res.data : order
      );
      setFilteredOrders(updatedOrders);

      setPopup({
        message: `Order #${orderId} status updated to "${newStatus}"`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      setPopup({
        message: `Failed to update order #${orderId}`,
        type: 'error',
      });
    }

    setTimeout(() => setPopup({ message: '', type: '' }), 5000);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      {/* Popup Notification */}
      {popup.message && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: popup.type === 'success' ? '#4CAF50' : '#f44336',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '5px',
            zIndex: 1000,
            minWidth: '200px',
            textAlign: 'center',
            transition: 'opacity 0.3s ease',
          }}
        >
          {popup.message}
        </div>
      )}

      <h1>Admin Orders</h1>

      <Link to="/admin/orders/create-order">
        <button
          style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Create Order
        </button>
      </Link>

      <input
        type="text"
        placeholder="Search by Customer Name or Order ID"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ padding: '10px', marginBottom: '20px', width: '100%' }}
      />

      {filteredOrders.length > 0 ? (
        <table
          border="1"
          cellPadding="10"
          cellSpacing="0"
          style={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th>Payment Method</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Address</th>
              <th>Delivery Type</th>
              <th>Logistics</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer_name || 'No user info'}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>{order.payment_method || 'Not Provided'}</td>
                <td>Php {order.total_price}</td>
                <td>{order.status || 'Not Provided'}</td>
                <td>{order.address || 'Not Provided'}</td>
                <td>{order.delivery_type}</td>
                <td>
                  <select
                    value={order.status || ''}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px',
                      fontSize: '14px',
                    }}
                  >
                    {ORDER_STATUS_CHOICES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No orders found.</div>
      )}
    </div>
  );
};

export default AdminOrders;