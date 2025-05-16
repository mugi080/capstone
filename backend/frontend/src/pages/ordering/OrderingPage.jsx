import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getBeverages } from "../../api/Products";
import SidePanel from "./SidePannel";

function OrderingPage() {
  const location = useLocation();
  const productToBuy = location.state?.productToBuy;

  const [beverages, setBeverages] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderStatus, setOrderStatus] = useState(""); // Admin input for order status
  const [adminComments, setAdminComments] = useState(""); // Admin input for comments
  const productRef = useRef(null);

  // Check if the user is an admin (from localStorage)
  const isAdmin = localStorage.getItem("user_role") === "admin";

  useEffect(() => {
    const fetchData = async () => {
      const beveragesData = await getBeverages();
      setBeverages(beveragesData);

      if (productToBuy) {
        setSelectedItems([{ ...productToBuy, quantity: 1 }]);
      }
    };

    fetchData();
  }, [productToBuy]);

  useEffect(() => {
    if (productToBuy && productRef.current) {
      productRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [beverages, productToBuy]);

  const handleAdd = (bev) => {
    setSelectedItems((prevItems) => {
      const itemIndex = prevItems.findIndex((item) => item.id === bev.id);
      if (itemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[itemIndex].quantity += 1;
        return updatedItems;
      } else {
        return [...prevItems, { ...bev, quantity: 1 }];
      }
    });
  };

  const handleRemove = (bev) => {
    setSelectedItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === bev.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Render the admin-specific controls (order status, comments, etc.)
  const renderAdminControls = () => (
    <div>
      <h3>Admin Controls</h3>
      <div>
        <label>Order Status:</label>
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        >
          <option value="">Select Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div>
        <label>Admin Comments:</label>
        <textarea
          value={adminComments}
          onChange={(e) => setAdminComments(e.target.value)}
          placeholder="Add any comments here..."
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
      </div>
      <button style={{ padding: "10px", background: "blue", color: "white" }}>Save Admin Info</button>
    </div>
  );

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 2 }}>
        <h1>Order Drinks</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          {beverages.map((bev) => (
            <div
              key={bev.id}
              ref={productToBuy?.id === bev.id ? productRef : null}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                background: productToBuy?.id === bev.id ? "#ffe0b3" : "white",
              }}
            >
              <img
                src={`http://127.0.0.1:8000${bev.image}`}
                alt={bev.name}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
              <h3>{bev.name}</h3>
              <p>{bev.volume}ml - Php{bev.price}</p>
              <div>
                <button onClick={() => handleRemove(bev)}>-</button>
                <span style={{ margin: "0 10px" }}>
                  {selectedItems.find((item) => item.id === bev.id)?.quantity || 0}
                </span>
                <button onClick={() => handleAdd(bev)}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Render admin controls if the user is an admin */}
        {isAdmin && renderAdminControls()}
      </div>

      <SidePanel selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
    </div>
  );
}

export default OrderingPage;
