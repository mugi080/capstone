import React from "react";
import { placeOrder } from "../../api/Order";

function SidePanel({ selectedItems, setSelectedItems }) {
    const totalPrice = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        const response = await placeOrder(selectedItems);
        if (response.success) {
            alert("Order placed successfully!");
            setSelectedItems([]); // Clear selected items after successful checkout
        } else {
            alert("Error: " + response.message); // Error message from API
        }
    };

    const handleRemoveItem = (item) => {
        setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
    };

    return (
        <div style={{ flex: 1, borderLeft: "2px solid #000", padding: "10px" }}>
            <h2>Order Summary</h2>
            <ul>
                {selectedItems.map((item) => (
                    <li key={item.id} onClick={() => handleRemoveItem(item)}>
                        {item.name} - {item.quantity}x - Php {item.price * item.quantity}
                    </li>
                ))}
            </ul>
            <h3>Total: Php {totalPrice.toFixed(2)}</h3>
            <button onClick={handleCheckout}>Checkout</button>
        </div>
    );
}

export default SidePanel;  // Add this line to make it a default export