import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase/firebase';
import {
    createOrder as createOrderService,
    getUserOrders as getUserOrdersService,
    getOrderById as getOrderByIdService,
    getAllOrders as getAllOrdersService,
    updateOrderStatus as updateOrderStatusService
} from '../services/orderSerivce'

export function useOrder() {
    const [userOrders, setUserOrders] = useState([]);
    const [adminOrders, setAdminOrders] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Check if the current user is an admin
    useEffect(() => {
        const checkAdminStatus = async () => {
            const user = auth.currentUser;
            if (user) {
                // You'd need to implement this function based on how you store user roles
                // For example, checking a 'role' field in your user database
                // This is just a placeholder
                setIsAdmin(user.email === 'admin@example.com'); // Replace with your admin check logic
            } else {
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, []);

    // Load user's orders
    const loadUserOrders = useCallback(async () => {
        if (!auth.currentUser) return;

        try {
            setLoading(true);
            setError(null);
            const orders = await getUserOrdersService();
            setUserOrders(orders);
        } catch (err) {
            console.error('Error loading user orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load all orders (admin only)
    const loadAllOrders = useCallback(async () => {
        if (!auth.currentUser || !isAdmin) return;

        try {
            setLoading(true);
            setError(null);
            const orders = await getAllOrdersService();
            setAdminOrders(orders);
        } catch (err) {
            console.error('Error loading all orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    // Load a specific order by ID
    const loadOrderById = useCallback(async (orderId) => {
        if (!auth.currentUser) return null;

        try {
            setLoading(true);
            setError(null);
            const order = await getOrderByIdService(orderId);
            setCurrentOrder(order);
            return order;
        } catch (err) {
            console.error(`Error loading order ${orderId}:`, err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new order
    const createOrder = useCallback(async (contactInfo, notes = "") => {
        if (!auth.currentUser) {
            throw new Error("You must be logged in to place an order");
        }

        try {
            setLoading(true);
            setError(null);
            const result = await createOrderService(contactInfo, notes);

            // Refresh user orders after creating a new one
            await loadUserOrders();

            return result;
        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadUserOrders]);

    // Update order status (admin only)
    const updateOrderStatus = useCallback(async (orderId, status) => {
        if (!auth.currentUser) {
            throw new Error("You must be logged in to update an order");
        }

        if (!isAdmin) {
            throw new Error("Only administrators can update order status");
        }

        try {
            setLoading(true);
            setError(null);

            const result = await updateOrderStatusService(orderId, status);

            // Update the order in our state
            if (currentOrder && currentOrder.id === orderId) {
                setCurrentOrder(prev => ({ ...prev, status }));
            }

            // Refresh admin orders
            await loadAllOrders();

            return result;
        } catch (err) {
            console.error('Error updating order status:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [isAdmin, currentOrder, loadAllOrders]);

    // Load user orders on mount and when user changes
    useEffect(() => {
        loadUserOrders();

        // If admin, also load all orders
        if (isAdmin) {
            loadAllOrders();
        }
    }, [loadUserOrders, loadAllOrders, isAdmin]);

    // Format date as "YYYY-MM-DD HH:MM:SS"
    const formatTimestamp = useCallback(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }, []);

    // Calculate order statistics for dashboard
    const getOrderStats = useCallback(() => {
        const orders = isAdmin ? adminOrders : userOrders;

        return {
            totalOrders: orders.length,
            pendingOrders: orders.filter(order => order.status === 'pending').length,
            completedOrders: orders.filter(order => order.status === 'completed').length,
            totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0)
        };
    }, [isAdmin, adminOrders, userOrders]);

    return {
        // Order data
        userOrders,
        adminOrders,
        currentOrder,

        // Status
        loading,
        error,
        isAdmin,

        // Functions
        loadUserOrders,
        loadAllOrders,
        loadOrderById,
        createOrder,
        updateOrderStatus,
        formatTimestamp,
        getOrderStats
    };
}