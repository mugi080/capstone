import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

export const placeOrder = async (selectedItems) => {
    try {
        const response = await axios.post(`${API_URL}place_order/`, { items: selectedItems }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });

        return {
            success: true,
            message: response.data.message,
            orderDetails: response.data.order_items,
            totalPrice: response.data.total_price,
        };
    } catch (error) {
        console.error("Error placing order:", error);
        return {
            success: false,
            message: error.response ? error.response.data.error : "Failed to place order",
        };
    }
};

export const fetchOrders = async () => {
    try {
        const response = await axios.get(`${API_URL}orders/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
        return response.data;  // Return the fetched orders
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];  // Return an empty array if there's an error
    }
};
