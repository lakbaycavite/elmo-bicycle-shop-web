import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, getDatabase } from 'firebase/database';
import { auth } from '../firebase/firebase';
import {
    addToCart as addToCartService,
    updateCartItemQuantity as updateQuantityService,
    removeFromCart as removeItemService,
    clearCart as clearCartService
} from '../services/cartService';
import { toast } from 'sonner';

// Helper: safe number parsing
function safeNumber(value, fallback = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? fallback : num;
}

export function useCart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [itemCount, setItemCount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);

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

        const unsubscribe = onValue(
            cartRef,
            (snapshot) => {
                try {
                    if (!snapshot.exists()) {
                        setCart([]);
                        setItemCount(0);
                        setTotalPrice(0);
                        setTotalDiscount(0);
                    } else {
                        const cartData = snapshot.val();
                        const cartItems = Object.keys(cartData).map((key) => ({
                            ...cartData[key],
                            productId: key,
                        }));

                        setCart(cartItems);

                        let currentItemCount = 0;
                        let currentTotalPrice = 0;
                        let currentTotalDiscount = 0;

                        cartItems.forEach((item) => {
                            const quantity = safeNumber(item.quantity, 0);
                            if (quantity <= 0) {
                                console.warn(`Invalid quantity for item ${item.productId}: ${item.quantity}`);
                                return;
                            }

                            currentItemCount += quantity;

                            const originalPrice = safeNumber(item.originalPrice);
                            const discountedFinalPrice = safeNumber(item.discountedFinalPrice);
                            const discountAmount = safeNumber(item.discountAmount);

                            let itemSubtotal = 0;
                            let itemDiscountTotal = 0;

                            if (discountedFinalPrice > 0) {
                                itemSubtotal = discountedFinalPrice * quantity;
                                itemDiscountTotal =
                                    discountAmount > 0
                                        ? discountAmount * quantity
                                        : originalPrice > 0
                                        ? (originalPrice - discountedFinalPrice) * quantity
                                        : 0;
                            } else if (originalPrice > 0) {
                                itemSubtotal = originalPrice * quantity;
                                itemDiscountTotal = 0;
                            } else {
                                const fallbackPrice = safeNumber(item.price);
                                if (fallbackPrice > 0) {
                                    itemSubtotal = fallbackPrice * quantity;
                                } else {
                                    console.warn(`No valid price found for item ${item.productId}`);
                                }
                                itemDiscountTotal = 0;
                            }

                            currentTotalPrice += itemSubtotal;
                            currentTotalDiscount += itemDiscountTotal;
                        });

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
            },
            (err) => {
                console.error("Firebase onValue error:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const addToCart = useCallback(async (productId, quantity, productDetails) => {
        try {
            // Warn if missing key price info
            if (!productDetails || (!productDetails.originalPrice && !productDetails.price)) {
                console.warn(`Product ${productId} has missing price details:`, productDetails);
            }
            setError(null);
            toast.success(`Item ${productDetails?.name || "Unnamed"} added to cart successfully!`);
            return await addToCartService(productId, quantity, productDetails);
        } catch (err) {
            setError(err.message);
            toast.error(`Failed to add item to cart: ${err.message}`);
            throw err;
        }
    }, []);

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
