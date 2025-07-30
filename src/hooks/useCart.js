import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, getDatabase } from 'firebase/database';
import { auth } from '../firebase/firebase';
import {
    addToCart as addToCartService,
    updateCartItemQuantity as updateQuantityService,
    removeFromCart as removeItemService,
    clearCart as clearCartService
} from '../services/cartService'
import { toast } from 'sonner';

export function useCart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [itemCount, setItemCount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);

    // Helper function to calculate the discount amount for a single item
    const calculateItemDiscountAmount = useCallback((item) => {
        // Use parseFloat for potentially decimal numbers and provide a default of 0
        const originalPrice = parseFloat(item.originalPrice || 0);
        const discountPercentage = parseFloat(item.discount || 0);
        const quantity = parseFloat(item.quantity || 0); // Quantity should also be a number

        if (isNaN(originalPrice) || isNaN(discountPercentage) || isNaN(quantity) || originalPrice <= 0 || discountPercentage <= 0) {
            return 0; // No valid discount or price
        }

        const discountAmountPerItem = originalPrice * (discountPercentage / 100);
        return discountAmountPerItem * quantity;
    }, []);

    // Subscribe to cart changes in real-time
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setCart([]);
            setItemCount(0);
            setTotalPrice(0);
            setTotalDiscount(0);
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
                    setTotalDiscount(0);
                } else {
                    const cartData = snapshot.val();
                    const cartItems = Object.keys(cartData).map(key => ({
                        ...cartData[key],
                        productId: key,
                    }));

                    setCart(cartItems);

                    let currentItemCount = 0;
                    let currentTotalPrice = 0;
                    let currentTotalDiscount = 0;

                    cartItems.forEach(item => {
                        const quantity = parseFloat(item.quantity || 0); // Ensure quantity is a number
                        if (isNaN(quantity)) {
                            console.warn(`Invalid quantity for item ${item.productId}: ${item.quantity}`);
                            return; // Skip this item if quantity is invalid
                        }
                        currentItemCount += quantity;

                        // Use parseFloat and provide a default of 0 to prevent NaN
                        const discountedFinalPrice = parseFloat(item.discountedFinalPrice || 0);
                        const originalPrice = parseFloat(item.originalPrice || 0);

                        let effectivePricePerItem;

                        // More robust check for valid discountedFinalPrice
                        if (discountedFinalPrice > 0 && !isNaN(discountedFinalPrice)) {
                            effectivePricePerItem = discountedFinalPrice;
                        } else if (originalPrice > 0 && !isNaN(originalPrice)) {
                            effectivePricePerItem = originalPrice;
                        } else {
                            console.warn(`Invalid price for item ${item.productId}. discountedFinalPrice: ${item.discountedFinalPrice}, originalPrice: ${item.originalPrice}`);
                            effectivePricePerItem = 0; // Default to 0 if both prices are invalid
                        }

                        currentTotalPrice += (effectivePricePerItem * quantity);

                        currentTotalDiscount += calculateItemDiscountAmount(item);
                    });
                    console.log("currentTotalPrice:", currentTotalPrice);
                    setItemCount(currentItemCount);
                    setTotalPrice(currentTotalPrice);
                    setTotalDiscount(currentTotalDiscount);
                }
                setError(null);
            } catch (err) {
                console.error("Error processing cart snapshot:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }, (err) => {
            console.error("Firebase onValue error:", err);
            setError(err.message);
            setLoading(false);
        });

        // Clean up subscription
        return () => unsubscribe();
    }, [calculateItemDiscountAmount]);

    // Add item to cart
    const addToCart = useCallback(async (productId, quantity, productDetails) => {
        try {
            setError(null);
            toast.success(`Item ${productDetails.name} added to cart successfully!`);
            return await addToCartService(productId, quantity, productDetails);
        } catch (err) {
            setError(err.message);
            toast.error(`Failed to add item to cart: ${err.message}`);
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
            toast.error(`Failed to update quantity: ${err.message}`);
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
            toast.error(`Failed to remove item: ${err.message}`);
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
            toast.error(`Failed to clear cart: ${err.message}`);
            throw err;
        }
    }, []);

    // Format the timestamp (kept as is)
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

    return {
        cart,
        loading,
        error,
        itemCount,
        totalPrice,
        totalDiscount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        formatTimestamp
    };
}