import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { placeOrder } from "../../api/Order";
import LocationPicker from "./LocationPicker";  // Assuming this component handles map interaction
import "./CheckoutForm.css";

function CheckoutForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems, totalPrice } = location.state || {};

  const storeLocation = { lat: 14.5995, lng: 120.9842 }; // Example coordinates of your store

  const [formData, setFormData] = useState({
    address: "",        // Coordinates (Lat, Lng)
    paymentMethod: "",
    deliveryType: "Pickup",
    contactNumber: ""   // NEW STATE FIELD
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = ({ lat, lng }) => {
    const coordinates = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setFormData((prev) => ({
      ...prev,
      address: coordinates
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paymentMethod || !formData.deliveryType || !formData.contactNumber) {
      alert("Please complete all fields including contact number.");
      return;
    }

    const orderData = {
      items: selectedItems,
      address: formData.address,
      paymentMethod: formData.paymentMethod,
      deliveryType: formData.deliveryType,
      contactNumber: formData.contactNumber  // INCLUDED IN ORDER DATA
    };

    const response = await placeOrder(orderData);

    if (response.success) {
      alert("Order placed successfully!");
      navigate("/orders");
    } else {
      alert("Error: " + response.message);
    }
  };

  if (!selectedItems || selectedItems.length === 0) {
    return <div>No items to checkout.</div>;
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <h3>Total Price: Php {totalPrice.toFixed(2)}</h3>

      <div className="order-summary">
        <h4>Order Summary</h4>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>Php {item.price}</td>
                <td>
                  Php{" "}
                  {item.total_price && !isNaN(item.total_price)
                    ? item.total_price.toFixed(2)
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Contact Number Field */}
        <div className="form-group">
          <label>Contact Number:</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            placeholder="e.g. 09123456789"
            pattern="[0-9]{11}"
            title="Please enter 11-digit phone number"
            required
          />
        </div>

        <div className="form-group">
          <label>Payment Method:</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            required
          >
            <option value="">Select payment method</option>
            <option value="credit_card">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="cash_on_delivery">Cash on Delivery</option>
          </select>
        </div>

        <div className="form-group">
          <label>Delivery Type:</label>
          <div className="radio-group">
            <input
              type="radio"
              id="pickup"
              name="deliveryType"
              value="Pickup"
              checked={formData.deliveryType === "Pickup"}
              onChange={handleInputChange}
            />
            <label htmlFor="pickup">Pickup</label>

            <input
              type="radio"
              id="delivered"
              name="deliveryType"
              value="Delivered"
              checked={formData.deliveryType === "Delivered"}
              onChange={handleInputChange}
            />
            <label htmlFor="delivered">Delivered</label>
          </div>
        </div>

        {/* Always show map with pinned store location */}
        <div className="form-group">
          <label>Select Location on Map:</label>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            pinLocation={storeLocation} // Pinned store location on map
          />
        </div>

        {/* If delivery type is Delivered, allow user to select a location */}
        {formData.deliveryType === "Delivered" && (
          <>
            <div className="form-group">
              <label>Address (auto-filled from map):</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )}

        {/* If delivery type is Pickup, use the store's address */}
        {formData.deliveryType === "Pickup" && (
          <div className="form-group">
            <label>Pickup Location:</label>
            <input
              type="text"
              name="address"
              value="St. Jude Street, Holy Spirit Subdivision, St Jude Street, Lucena, 4301 Quezon"
              disabled
            />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutForm;