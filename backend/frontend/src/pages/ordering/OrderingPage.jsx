import React, { useState, useEffect } from "react";
import { getBeverages } from "../../api/Products";
import SidePanel from "./SidePannel"; // Updated name

function OrderingPage() {
  const [beverages, setBeverages] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const beveragesData = await getBeverages();
      setBeverages(beveragesData);
    };
    fetchData();
  }, []);

  const handleAdd = (bev) => {
    setSelectedItems((prevItems) => {
        const itemIndex = prevItems.findIndex((item) => item.id === bev.id);
        if (itemIndex >= 0) {
            // Update existing item
            const updatedItems = [...prevItems];
            updatedItems[itemIndex].quantity += 1;
            return updatedItems;
        } else {
            // Add new item
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

  return (
    <div style={{ display: "flex" }}>
      {/* Ordering Section */}
      <div style={{ flex: 2 }}>
        <h1>Order Drinks</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {beverages.map((bev) => (
            <div key={bev.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
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
      </div>

      {/* Side Panel Section */}
      <SidePanel selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
    </div>
  );
}

export default OrderingPage;
