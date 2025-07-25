import { ref, push, set, remove, get, query, orderByChild, equalTo } from "firebase/database";
import { auth, database } from '../firebase/firebase';

/**
 * Add a product to the user's wishlist
 * 
 * @param {Object} product - The product to add to wishlist
 * @returns {Promise<string>} - The wishlist item ID
 */
export const addToWishlist = async (product) => {
    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("User must be logged in to add to wishlist");
        }

        // Check if product is already in wishlist
        const existingItem = await checkInWishlist(product.id);
        if (existingItem) {
            console.log("Product already in wishlist");
            return existingItem.id;
        }

        // Create a new wishlist item
        const wishlistRef = ref(database, "wishlists");
        const newItemRef = push(wishlistRef);

        const wishlistItem = {
            productId: product.id,
            userId: user.uid,
            name: product.name,
            price: product.price,
            image: product.image || "",
            category: product.category || "",
            description: product.description || "",
            dateAdded: new Date().toISOString()
        };

        await set(newItemRef, wishlistItem);
        console.log("Product added to wishlist:", product.name);

        return newItemRef.key;
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        throw error;
    }
};

/**
 * Check if a product is already in the user's wishlist
 * 
 * @param {string} productId - The ID of the product to check
 * @returns {Promise<Object|null>} - The wishlist item if found, null otherwise
 */
export const checkInWishlist = async (productId) => {
    try {
        const user = auth.currentUser;

        if (!user) {
            return null;
        }

        const wishlistRef = ref(database, "wishlists");
        const userWishlistQuery = query(
            wishlistRef,
            orderByChild("userId"),
            equalTo(user.uid)
        );

        const snapshot = await get(userWishlistQuery);
        if (!snapshot.exists()) {
            return null;
        }

        let foundItem = null;
        snapshot.forEach((childSnapshot) => {
            const item = childSnapshot.val();
            if (item.productId === productId) {
                foundItem = { id: childSnapshot.key, ...item };
                return true; // Break the forEach loop
            }
        });

        return foundItem;
    } catch (error) {
        console.error("Error checking wishlist:", error);
        throw error;
    }
};

/**
 * Get all items in the user's wishlist
 * 
 * @returns {Promise<Array>} - Array of wishlist items
 */
export const getUserWishlist = async () => {
    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("User must be logged in to view wishlist");
        }

        const wishlistRef = ref(database, "wishlists");
        const userWishlistQuery = query(
            wishlistRef,
            orderByChild("userId"),
            equalTo(user.uid)
        );

        const snapshot = await get(userWishlistQuery);
        if (!snapshot.exists()) {
            return [];
        }

        const wishlistItems = [];
        snapshot.forEach((childSnapshot) => {
            wishlistItems.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Sort by date added (newest first)
        return wishlistItems.sort((a, b) =>
            new Date(b.dateAdded) - new Date(a.dateAdded)
        );
    } catch (error) {
        console.error("Error getting wishlist:", error);
        throw error;
    }
};

/**
 * Remove an item from the user's wishlist
 * 
 * @param {string} itemId - The ID of the wishlist item to remove
 * @returns {Promise<void>}
 */
export const removeFromWishlist = async (itemId) => {
    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("User must be logged in to modify wishlist");
        }

        // Verify the item belongs to the user
        const itemRef = ref(database, `wishlists/${itemId}`);
        const snapshot = await get(itemRef);

        if (!snapshot.exists()) {
            throw new Error("Wishlist item not found");
        }

        const item = snapshot.val();
        if (item.userId !== user.uid) {
            throw new Error("You don't have permission to remove this item");
        }

        await remove(itemRef);
        console.log("Item removed from wishlist");
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        throw error;
    }
};

/**
 * Move an item from wishlist to cart
 * 
 * @param {string} itemId - The ID of the wishlist item
 * @param {Function} addToCartFn - The function to add to cart
 * @returns {Promise<void>}
 */
export const moveToCart = async (itemId, addToCartFn) => {
    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("User must be logged in");
        }

        // Get the item details
        const itemRef = ref(database, `wishlists/${itemId}`);
        const snapshot = await get(itemRef);

        if (!snapshot.exists()) {
            throw new Error("Wishlist item not found");
        }

        const item = snapshot.val();
        console.log("Moving wishlist item to cart:", item);

        // Add to cart
        await addToCartFn(item.productId, 1, {
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            description: item.description
        });

        // Remove from wishlist
        await removeFromWishlist(itemId);

        console.log("Item moved from wishlist to cart");
    } catch (error) {
        console.error("Error moving to cart:", error);
        throw error;
    }
};

/**
 * Clear all items from the user's wishlist
 * 
 * @returns {Promise<void>}
 */
export const clearWishlist = async () => {
    try {
        const wishlistItems = await getUserWishlist();

        const removePromises = wishlistItems.map(item =>
            removeFromWishlist(item.id)
        );

        await Promise.all(removePromises);
        console.log("Wishlist cleared");
    } catch (error) {
        console.error("Error clearing wishlist:", error);
        throw error;
    }
};