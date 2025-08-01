import { getDatabase, ref, push, set, get, update, query, orderByChild, equalTo, remove } from "firebase/database";
import { auth } from "../firebase/firebase";
import { clearCart, getCartItems } from "./cartService";
import { addSpinAttempts } from "./discountService";

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
export const createOrder = async (notes = "", orderDetails = {}) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in to place an order");

        // Get cart items
        const cartItems = await getCartItems();
        if (!cartItems.length) throw new Error("Your cart is empty");

        // Calculate total amount
        const totalAmount = orderDetails.total || cartItems.reduce((total, item) =>
            total + (item.price * item.quantity), 0);

        const db = getDatabase();
        const ordersRef = ref(db, "orders");

        // Create order object - matching validation rules structure
        const newOrder = {
            userId: user.uid,  // Used for user-specific access
            userEmail: user.email,
            userName: orderDetails.fullName || "User",
            items: cartItems,
            status: "pending",
            totalAmount,
            subtotal: orderDetails.subtotal || totalAmount,
            discount: orderDetails.discount || 0,
            discountPercentage: orderDetails.discountPercentage || 0,
            products: orderDetails.cart || null,
            paymentMethod: orderDetails.paymentMethod || "Walk-in",
            createdAt: orderDetails.orderDate || getCurrentFormattedTime(),
            notes,
            isRated: false, // Track if the order has been rated
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

// Update order rated status
export const updateOrderRatedStatus = async (orderId, isRated = true) => {
    try {
        const db = getDatabase();
        const orderRef = ref(db, `orders/${orderId}`);

        // Update only the isRated field
        await update(orderRef, {
            isRated,
            ratedAt: getCurrentFormattedTime()
        });

        return {
            success: true,
            message: "Order rating status updated"
        };
    } catch (error) {
        console.error("Error updating order rating status:", error);
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

        // Query orders for current user using the indexed userId field
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
        return orders.sort((a, b) => {
            // Safe handling of date comparison
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
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

// Admin: Update order status (modified to accept an updates object)
export const updateOrderStatus = async (orderId, updates) => {
    try {
        const db = getDatabase();
        const orderRef = ref(db, `orders/${orderId}`);

        // Get the order first to check current status and get order details
        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) {
            throw new Error("Order not found");
        }

        const order = orderSnapshot.val();
        const previousStatus = order.status;

        // Merge existing data with new updates
        const newStatus = updates.status || order.status; // Use new status if provided, else keep old
        const newCancelReason = updates.cancelReason !== undefined ? updates.cancelReason : order.cancelReason || "";
        const newPaymentMethod = updates.paymentMethod || order.paymentMethod || "Walk-in";

        await update(orderRef, {
            ...updates, // Apply all updates passed in
            status: newStatus,
            cancelReason: newCancelReason,
            paymentMethod: newPaymentMethod,
            updatedAt: getCurrentFormattedTime()
        });

        // If order status changed from pending to paid, add spin attempts
        if (previousStatus === "pending" && newStatus === "paid") {
            try {
                // Use the potentially updated totalAmount from 'updates' or the original order's totalAmount
                const amountForSpinAttempts = updates.totalAmount !== undefined ? updates.totalAmount : order.totalAmount;
                await addSpinAttempts(order.userId, amountForSpinAttempts);
            } catch (spinError) {
                console.error("Error adding spin attempts:", spinError);
                // Don't throw error here as the order update was successful
            }
        }

        return {
            success: true,
            message: `Order status updated to ${newStatus}`,
            spinAttemptsAdded: previousStatus === "pending" && newStatus === "paid"
        };
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};

export const deleteOrder = async (orderId) => {
    try {
        const db = getDatabase();
        const orderRef = ref(db, `orders/${orderId}`);

        await remove(orderRef);

        return {
            success: true,
            message: `Order ${orderId} deleted successfully`
        };
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
    }
};

// Apply discount voucher to order calculation
export const calculateOrderWithDiscount = (orderDetails, voucherDiscount = 0) => {
    const subtotal = orderDetails.subtotal || 0;
    const discountAmount = (subtotal * voucherDiscount) / 100;
    const total = subtotal - discountAmount;

    return {
        ...orderDetails,
        subtotal: subtotal,
        discount: discountAmount,
        discountPercentage: voucherDiscount,
        total: total
    };
};