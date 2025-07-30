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

    const calculateItemDiscountAmount = useCallback((item) => {
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
                        console.log(`Processing item: ${item.name || item.productId}`, {
                            quantity: item.quantity,
                            originalPrice: item.originalPrice,
                            discountedFinalPrice: item.discountedFinalPrice,
                            discount: item.discount,
                            discountAmount: item.discountAmount
                        });

                        const quantity = parseFloat(item.quantity || 0);
                        if (isNaN(quantity) || quantity <= 0) {
                            console.warn(`Invalid quantity for item ${item.productId}: ${item.quantity}`);
                            return;
                        }

                        currentItemCount += quantity;

                        // Parse all price-related fields
                        const originalPrice = parseFloat(item.originalPrice || 0);
                        const discountedFinalPrice = parseFloat(item.discountedFinalPrice || 0);
                        const discountAmount = parseFloat(item.discountAmount || 0);

                        let itemSubtotal = 0;
                        let itemDiscountTotal = 0;

                        // Case 1: Item has a discounted final price
                        if (discountedFinalPrice > 0 && !isNaN(discountedFinalPrice)) {
                            itemSubtotal = discountedFinalPrice * quantity;

                            // Calculate discount amount if not explicitly provided
                            if (discountAmount > 0 && !isNaN(discountAmount)) {
                                itemDiscountTotal = discountAmount * quantity;
                            } else if (originalPrice > 0) {
                                // Calculate discount based on price difference
                                const discountPerItem = originalPrice - discountedFinalPrice;
                                itemDiscountTotal = discountPerItem * quantity;
                            }
                        }
                        // Case 2: Item has original price but no discount
                        else if (originalPrice > 0 && !isNaN(originalPrice)) {
                            itemSubtotal = originalPrice * quantity;
                            itemDiscountTotal = 0;
                        }
                        // Case 3: Fallback to any available price field
                        else {
                            const fallbackPrice = parseFloat(item.price || 0);
                            if (fallbackPrice > 0 && !isNaN(fallbackPrice)) {
                                itemSubtotal = fallbackPrice * quantity;
                                itemDiscountTotal = 0;
                            } else {
                                console.warn(`No valid price found for item ${item.productId}`);
                                itemSubtotal = 0;
                                itemDiscountTotal = 0;
                            }
                        }

                        console.log(`Item calculation result:`, {
                            itemSubtotal,
                            itemDiscountTotal,
                            effectivePrice: itemSubtotal / quantity
                        });

                        currentTotalPrice += itemSubtotal;
                        currentTotalDiscount += itemDiscountTotal;
                    });

                    console.log("Final totals:", {
                        currentItemCount,
                        currentTotalPrice,
                        currentTotalDiscount,
                        finalTotal: currentTotalPrice - currentTotalDiscount
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
        }, (err) => {
            console.error("Firebase onValue error:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []); // Remove calculateItemDiscountAmount dependency since we're not using it anymore


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