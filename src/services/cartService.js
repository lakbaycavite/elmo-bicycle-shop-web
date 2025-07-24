import { getDatabase, ref, set, get, update, remove } from "firebase/database";
import { auth } from "../firebase/firebase";

// Format current date/time as YYYY-MM-DD HH:MM:SS
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

// Add item to cart
export const addToCart = async (productId, quantity = 1, productDetails = {}) => {
    try {
        const user = auth.currentUser;
        if (user.role === "admin" || user.role === null || user.role === undefined) {
            throw new Error("Admins cannot add items to cart");
        }
        if (!user) throw new Error("User must be logged in to add to cart");

        const db = getDatabase();
        const cartItemRef = ref(db, `users/${user.uid}/cart/${productId}`);

        // Check if item already exists in cart
        const snapshot = await get(cartItemRef);
        const timestamp = getCurrentFormattedTime();

        if (snapshot.exists()) {
            // Item exists, update quantity
            const currentQuantity = snapshot.val().quantity || 0;
            const newQuantity = currentQuantity + quantity;

            await update(cartItemRef, {
                quantity: newQuantity,
                updatedAt: timestamp
            });

            return {
                success: true,
                message: `Updated quantity to ${newQuantity}`,
                cartItem: {
                    productId,
                    quantity: newQuantity,
                    updatedAt: timestamp
                }
            };
        } else {
            // Item doesn't exist, add new item
            const cartItem = {
                productId,
                quantity,
                addedAt: timestamp,
                ...productDetails // Store any additional product details if needed
            };

            await set(cartItemRef, cartItem);

            return {
                success: true,
                message: "Item added to cart",
                cartItem
            };
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
};

// Update cart item quantity
export const updateCartItemQuantity = async (productId, quantity) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be logged in to update cart");

        const db = getDatabase();
        const cartItemRef = ref(db, `users/${user.uid}/cart/${productId}`);

        // Check if item exists
        const snapshot = await get(cartItemRef);
        if (!snapshot.exists()) {
            throw new Error("Item not found in cart");
        }

        if (quantity <= 0) {
            // If quantity is 0 or negative, remove item
            await remove(cartItemRef);
            return {
                success: true,
                message: "Item removed from cart"
            };
        } else {
            // Update quantity
            await update(cartItemRef, {
                quantity,
                updatedAt: getCurrentFormattedTime()
            });

            return {
                success: true,
                message: `Quantity updated to ${quantity}`
            };
        }
    } catch (error) {
        console.error("Error updating cart item:", error);
        throw error;
    }
};

// Remove item from cart
export const removeFromCart = async (productId) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be logged in to remove from cart");

        const db = getDatabase();
        const cartItemRef = ref(db, `users/${user.uid}/cart/${productId}`);

        await remove(cartItemRef);

        return {
            success: true,
            message: "Item removed from cart"
        };
    } catch (error) {
        console.error("Error removing from cart:", error);
        throw error;
    }
};

// Get all cart items
export const getCartItems = async () => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be logged in to view cart");

        const db = getDatabase();
        const cartRef = ref(db, `users/${user.uid}/cart`);

        const snapshot = await get(cartRef);
        if (!snapshot.exists()) {
            return [];
        }

        const cartItems = [];
        snapshot.forEach((childSnapshot) => {
            cartItems.push(childSnapshot.val());
        });

        return cartItems;
    } catch (error) {
        console.error("Error getting cart items:", error);
        throw error;
    }
};

// Clear entire cart
export const clearCart = async () => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be logged in to clear cart");

        const db = getDatabase();
        const cartRef = ref(db, `users/${user.uid}/cart`);

        await remove(cartRef);

        return {
            success: true,
            message: "Cart cleared successfully"
        };
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
};

// Count items in cart (for cart badge)
export const getCartItemCount = async () => {
    try {
        const cartItems = await getCartItems();
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
        console.error("Error counting cart items:", error);
        return 0;
    }
};