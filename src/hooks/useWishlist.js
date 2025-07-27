import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    addToWishlist,
    getUserWishlist,
    removeFromWishlist,
    checkInWishlist,
    moveToCart,
    clearWishlist
} from '../services/wishlistService';
import { toast } from 'sonner';

/**
 * Hook for managing user wishlist
 * @param {Function} addToCartFn - Function to add items to cart (for move to cart functionality)
 */
export const useWishlist = (addToCartFn) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const auth = getAuth();

    // Load user's wishlist
    const loadWishlist = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const items = await getUserWishlist();
            setWishlist(items);
        } catch (err) {
            console.error("Error loading wishlist:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Add item to wishlist
    const addItem = useCallback(async (product) => {
        try {
            setError(null);
            await addToWishlist(product);
            await loadWishlist(); // Refresh the wishlist
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, [loadWishlist]);

    // Remove item from wishlist
    const removeItem = useCallback(async (itemId) => {
        try {
            setError(null);
            await removeFromWishlist(itemId)
                .then(() => {
                    // toast.success("Item removed from wishlist");
                })
            setWishlist(current => current.filter(item => item.id !== itemId));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, []);

    // Check if product is in wishlist
    const isInWishlist = useCallback(async (productId) => {
        try {
            const item = await checkInWishlist(productId);
            return !!item;
        } catch (err) {
            console.error("Error checking wishlist:", err);
            return false;
        }
    }, []);

    // Move item from wishlist to cart
    const moveItemToCart = useCallback(async (itemId) => {
        setLoading(true);
        if (!addToCartFn) {
            setError("Add to cart function not provided");
            return false;
        }

        try {
            setError(null);
            await moveToCart(itemId, addToCartFn);
            setWishlist(current => current.filter(item => item.id !== itemId));
            setLoading(false);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, [addToCartFn]);

    // Clear entire wishlist
    const clearItems = useCallback(async () => {
        try {
            setError(null);
            await clearWishlist();
            setWishlist([]);
            toast.success("Wishlist cleared successfully");
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, []);

    // Listen for auth state changes and reload wishlist
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadWishlist();
            } else {
                setWishlist([]);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, loadWishlist]);

    return {
        wishlist,
        loading,
        error,
        addItem,
        removeItem,
        isInWishlist,
        moveItemToCart,
        clearItems,
        refreshWishlist: loadWishlist
    };
};