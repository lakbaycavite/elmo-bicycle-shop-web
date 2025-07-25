import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, getDatabase } from 'firebase/database';
import { auth } from '../firebase/firebase';
import {
    addToCart as addToCartService,
    updateCartItemQuantity as updateQuantityService,
    removeFromCart as removeItemService,
    clearCart as clearCartService
} from '../services/cartService'
import Cart from '../pages/post-auth/Cart';
import { toast } from 'sonner';

export function useCart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [itemCount, setItemCount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    // Subscribe to cart changes in real-time
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setCart([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const db = getDatabase();
        const cartRef = ref(db, `users/${user.uid}/cart`);

        const unsubscribe = onValue(cartRef, (snapshot) => {
            try {
                if (!snapshot.exists()) {
                    setCart([]);
                    setItemCount(0);
                    setTotalPrice(0);
                } else {
                    const cartData = snapshot.val();
                    const cartItems = Object.keys(cartData).map(key => ({
                        ...cartData[key],
                        productId: key,
                    }));

                    setCart(cartItems);

                    // Calculate totals
                    setItemCount(cartItems.reduce((total, item) => total + item.quantity, 0));
                    setTotalPrice(cartItems.reduce((total, item) =>
                        total + ((item.price || 0) * item.quantity), 0));
                }
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });


        // Clean up subscription
        return () => unsubscribe();
    }, []);

    // Add item to cart
    const addToCart = useCallback(async (productId, quantity, productDetails) => {
        try {
            setError(null);
            toast.success(`Item ${productDetails.name} added to cart successfully!`);
            return await addToCartService(productId, quantity, productDetails);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Update item quantity
    const updateQuantity = useCallback(async (productId, quantity) => {
        try {
            setError(null);
            return await updateQuantityService(productId, quantity);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Remove item from cart
    const removeItem = useCallback(async (productId) => {
        try {
            setError(null);
            toast.success(`Item removed from cart successfully!`);
            return await removeItemService(productId);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Clear entire cart
    const clearCart = useCallback(async () => {
        try {
            setError(null);
            return await clearCartService();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Format the timestamp
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

    useEffect(() => {

    })

    return {
        cart,
        loading,
        error,
        itemCount,
        totalPrice,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        formatTimestamp
    };
}