import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase/firebase';
import {
    createOrder as createOrderService,
    getUserOrders as getUserOrdersService,
    getOrderById as getOrderByIdService,
    getAllOrders as getAllOrdersService,
    updateOrderStatus as updateOrderStatusService,
    updateOrderRatedStatus as updateOrderRatedStatusService

} from '../services/orderSerivce'
import { get, getDatabase, ref, onValue, off, query, orderByChild, equalTo } from 'firebase/database';

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
                try {
                    const db = getDatabase();

                    // Check if user has admin/staff role in users collection
                    const userRef = ref(db, `users/${user.uid}`);
                    const userSnapshot = await get(userRef);

                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.val();
                        // Check if the user has a role field with value 'admin' or 'staff'
                        if (userData.role === 'admin' || userData.role === 'staff') {
                            setIsAdmin(true);
                            return; // Exit early if we found a role
                        }
                    }

                    // Fallback to email check if no role found
                    const isAdminEmail = user.email === 'admin@elmo.com';
                    setIsAdmin(isAdminEmail);

                } catch (error) {
                    console.error("Error checking admin status:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, []);

    // Real-time listener for user's orders
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setUserOrders([]);
            return;
        }

        const db = getDatabase();
        const ordersRef = ref(db, "orders");

        // Query orders for current user
        const userOrdersQuery = query(
            ordersRef,
            orderByChild("userId"),
            equalTo(user.uid)
        );

        const unsubscribe = onValue(userOrdersQuery, (snapshot) => {
            if (!snapshot.exists()) {
                setUserOrders([]);
                return;
            }

            // Format orders with their IDs
            const orders = [];
            snapshot.forEach((childSnapshot) => {
                orders.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // Sort by date (newest first)
            const sortedOrders = orders.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            setUserOrders(sortedOrders);
        }, (error) => {
            console.error("Error listening to user orders:", error);
            setError(error.message);
        });

        // Cleanup listener on unmount
        return () => {
            off(userOrdersQuery, 'value', unsubscribe);
        };
    }, []);

    // Real-time listener for all orders (admin only)
    useEffect(() => {
        if (!isAdmin) {
            setAdminOrders([]);
            return;
        }

        const db = getDatabase();
        const ordersRef = ref(db, "orders");

        const unsubscribe = onValue(ordersRef, (snapshot) => {
            if (!snapshot.exists()) {
                setAdminOrders([]);
                return;
            }

            const orders = [];
            snapshot.forEach((childSnapshot) => {
                orders.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // Sort by date (newest first)
            const sortedOrders = orders.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setAdminOrders(sortedOrders);
        }, (error) => {
            console.error("Error listening to all orders:", error);
            setError(error.message);
        });

        // Cleanup listener on unmount
        return () => {
            off(ordersRef, 'value', unsubscribe);
        };
    }, [isAdmin]);

    // Real-time listener for a specific order
    const subscribeToOrder = useCallback((orderId) => {
        if (!orderId) return () => { };

        const db = getDatabase();
        const orderRef = ref(db, `orders/${orderId}`);

        const unsubscribe = onValue(orderRef, (snapshot) => {
            if (snapshot.exists()) {
                setCurrentOrder({
                    id: orderId,
                    ...snapshot.val()
                });
            } else {
                setCurrentOrder(null);
                setError("Order not found");
            }
        }, (error) => {
            console.error(`Error listening to order ${orderId}:`, error);
            setError(error.message);
        });

        return () => {
            off(orderRef, 'value', unsubscribe);
        };
    }, []);

    // Load user's orders (kept for backward compatibility, but real-time listener is preferred)
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

    // Load all orders (kept for backward compatibility, but real-time listener is preferred)
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

    // Load a specific order by ID (one-time load)
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
    const createOrder = useCallback(async (notes = "", orderDetails) => {
        if (!auth.currentUser) {
            throw new Error("You must be logged in to place an order");
        }

        try {
            setLoading(true);
            setError(null);
            const result = await createOrderService(notes, orderDetails);

            // No need to manually refresh - real-time listener will handle it
            return result;
        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update order status (admin only) - Modified to accept an updates object
    const updateOrderStatus = useCallback(async (orderId, updates) => {
        if (!auth.currentUser) {
            throw new Error("You must be logged in to update an order");
        }

        if (!isAdmin) {
            throw new Error("Only administrators can update order status");
        }

        try {
            setLoading(true);
            setError(null);

            // Pass the entire updates object to the service
            const result = await updateOrderStatusService(orderId, updates);

            // No need to manually refresh - real-time listeners will handle it
            return result;
        } catch (err) {
            console.error('Error updating order status:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    const updateOrderRatedStatus = useCallback(async (orderId, isRated = true) => {
        if (!auth.currentUser) {
            throw new Error("You must be logged in to update an order");
        }

        try {
            setLoading(true);
            setError(null);
            const result = await updateOrderRatedStatusService(orderId, isRated);
            return result;
        } catch (err) {
            console.error('Error updating order rating status:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

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
        loadUserOrders, // Keep for backward compatibility
        loadAllOrders, // Keep for backward compatibility
        loadOrderById,
        createOrder,
        updateOrderStatus, // This function is now more flexible
        updateOrderRatedStatus, // New function

        formatTimestamp,
        getOrderStats,
        subscribeToOrder // New function for subscribing to specific order updates
    };
}
