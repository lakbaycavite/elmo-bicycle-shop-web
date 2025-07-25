import { getDatabase, ref, push, set, get, update, query, orderByChild, equalTo } from "firebase/database";
import { auth } from "../firebase/firebase";
import { clearCart, getCartItems } from "./cartService";

// Format current date/time
const getCurrentFormattedTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Create a new order from cart
export const createOrder = async (contactInfo, notes = "") => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in to place an order");

        // Get cart items
        const cartItems = await getCartItems();
        if (!cartItems.length) throw new Error("Your cart is empty");

        // Calculate total amount
        const totalAmount = cartItems.reduce((total, item) =>
            total + (item.price * item.quantity), 0);

        const db = getDatabase();
        const ordersRef = ref(db, "orders");

        // Create order object
        const newOrder = {
            userId: user.uid,
            items: cartItems,
            status: "pending",
            totalAmount,
            createdAt: getCurrentFormattedTime(),
            notes,
            contact: contactInfo
        };

        // Add to database
        const newOrderRef = push(ordersRef);
        await set(newOrderRef, newOrder);

        // Clear the cart after successful order
        await clearCart();

        return {
            success: true,
            orderId: newOrderRef.key,
            message: "Order placed successfully"
        };
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

// Get all orders for current user
export const getUserOrders = async () => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in to view orders");

        const db = getDatabase();
        const ordersRef = ref(db, "orders");

        // Query orders for current user
        const userOrdersQuery = query(
            ordersRef,
            orderByChild("userId"),
            equalTo(user.uid)
        );

        const snapshot = await get(userOrdersQuery);
        if (!snapshot.exists()) return [];

        // Format orders with their IDs
        const orders = [];
        snapshot.forEach((childSnapshot) => {
            orders.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Sort by date (newest first)
        return orders.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    } catch (error) {
        console.error("Error getting user orders:", error);
        throw error;
    }
};

// Get specific order by ID
export const getOrderById = async (orderId) => {
    try {
        const db = getDatabase();
        const orderRef = ref(db, `orders/${orderId}`);

        const snapshot = await get(orderRef);
        if (!snapshot.exists()) throw new Error("Order not found");

        return {
            id: orderId,
            ...snapshot.val()
        };
    } catch (error) {
        console.error("Error getting order:", error);
        throw error;
    }
};

// Admin: Get all orders
export const getAllOrders = async () => {
    try {
        const db = getDatabase();
        const ordersRef = ref(db, "orders");

        const snapshot = await get(ordersRef);
        if (!snapshot.exists()) return [];

        const orders = [];
        snapshot.forEach((childSnapshot) => {
            orders.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Sort by date (newest first)
        return orders.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    } catch (error) {
        console.error("Error getting all orders:", error);
        throw error;
    }
};

// Admin: Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
        if (status !== "pending" && status !== "completed") {
            throw new Error("Invalid status. Must be 'pending' or 'completed'");
        }

        const db = getDatabase();
        const orderRef = ref(db, `orders/${orderId}`);

        await update(orderRef, {
            status,
            updatedAt: getCurrentFormattedTime()
        });

        return {
            success: true,
            message: `Order status updated to ${status}`
        };
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};