import { getDatabase, ref, get, set, update, push, query, orderByChild, equalTo, remove } from "firebase/database";
import { auth } from "../firebase/firebase";

// Get current formatted time
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

// Get spin wheel configuration (admin can edit these)
// export const getSpinWheelConfig = async () => {
//     try {
//         const db = getDatabase();
//         const configRef = ref(db, "spinWheelConfig");
//         const snapshot = await get(configRef);

//         // Default configuration if none exists
//         const defaultConfig = {
//             segments: [
// { id: 1, label: "5% OFF", discount: 5, color: "#FF6B6B" },
// { id: 2, label: "Better Luck Next Time", discount: 0, color: "#4ECDC4" },
// { id: 3, label: "10% OFF", discount: 10, color: "#45B7D1" },
// { id: 4, label: "Better Luck Next Time", discount: 0, color: "#96CEB4" },
// { id: 5, label: "15% OFF", discount: 15, color: "#FFEAA7" },
// { id: 6, label: "Better Luck Next Time", discount: 0, color: "#DDA0DD" },
// { id: 7, label: "20% OFF", discount: 20, color: "#98D8C8" },
// { id: 8, label: "Better Luck Next Time", discount: 0, color: "#F7DC6F" }
//             ],
//             minOrderAmount: 1000
//         };

//         if (!snapshot.exists()) {
//             // Create default config if it doesn't exist
//             await set(configRef, defaultConfig);
//             return defaultConfig;
//         }

//         return snapshot.val();
//     } catch (error) {
//         console.error("Error getting spin wheel config:", error);
//         throw error;
//     }
// };
// New getSpinWheelConfig (Read-Only)
export const getSpinWheelConfig = async () => {
    try {
        const db = getDatabase();
        const configRef = ref(db, "spinWheelConfig");
        const snapshot = await get(configRef);

        if (snapshot.exists()) {
            return snapshot.val();
        }
        // Return a default object if nothing is in the database, but DO NOT write.
        return {
            segments: [
                { id: 1, label: "5% OFF", discount: 5, color: "#FF6B6B" },
                { id: 2, label: "Better Luck Next Time", discount: 0, color: "#4ECDC4" },
                { id: 3, label: "10% OFF", discount: 10, color: "#45B7D1" },
                { id: 4, label: "Better Luck Next Time", discount: 0, color: "#96CEB4" },
                { id: 5, label: "15% OFF", discount: 15, color: "#FFEAA7" },
                { id: 6, label: "Better Luck Next Time", discount: 0, color: "#DDA0DD" },
                { id: 7, label: "20% OFF", discount: 20, color: "#98D8C8" },
                { id: 8, label: "Better Luck Next Time", discount: 0, color: "#F7DC6F" }
            ],
            minOrderAmount: 1000
        };
    } catch (error) {
        console.error("Error getting spin wheel config:", error);
        throw error;
    }
};


// Update spin wheel configuration (admin only)
export const updateSpinWheelConfig = async (config) => {
    try {
        const db = getDatabase();
        const configRef = ref(db, "spinWheelConfig");
        await set(configRef, {
            ...config,
            updatedAt: getCurrentFormattedTime()
        });
        return { success: true, message: "Spin wheel configuration updated successfully" };
    } catch (error) {
        console.error("Error updating spin wheel config:", error);
        throw error;
    }
};

// Check how many spin attempts a user has
export const getUserSpinAttempts = async (userId = null) => {
    try {
        const user = auth.currentUser;
        const targetUserId = userId || user?.uid;

        if (!targetUserId) throw new Error("User must be logged in");

        const db = getDatabase();
        const userRef = ref(db, `users/${targetUserId}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            return { spinAttempts: 0 };
        }

        const userData = snapshot.val();
        return {
            spinAttempts: userData.spinAttempts || 0,
            totalSpent: userData.totalSpent || 0
        };
    } catch (error) {
        console.error("Error getting user spin attempts:", error);
        throw error;
    }
};

// Add spin attempts based on successful orders
export const addSpinAttempts = async (userId, orderAmount) => {
    try {
        const config = await getSpinWheelConfig();
        const minOrderAmount = config.minOrderAmount || 1000;

        // Determine if a spin attempt should be added (one attempt per transaction >= minOrderAmount)
        const attemptsToAdd = orderAmount >= minOrderAmount ? 1 : 0;

        if (attemptsToAdd === 0) {
            return { attemptsAdded: 0, totalAttempts: null };
        }

        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);

        let currentAttempts = 0;
        let currentTotalSpent = 0;

        if (snapshot.exists()) {
            const userData = snapshot.val();
            currentAttempts = userData.spinAttempts || 0;
            currentTotalSpent = userData.totalSpent || 0;
        }

        await update(userRef, {
            spinAttempts: currentAttempts + attemptsToAdd,
            totalSpent: currentTotalSpent + orderAmount,
            lastOrderDate: getCurrentFormattedTime()
        });

        return {
            attemptsAdded: attemptsToAdd,
            totalAttempts: currentAttempts + attemptsToAdd
        };
    } catch (error) {
        console.error("Error adding spin attempts:", error);
        throw error;
    }
};

// Use one spin attempt and create a voucher if discount is won
export const spinWheel = async () => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be logged in");

        const { spinAttempts } = await getUserSpinAttempts();
        if (spinAttempts <= 0) {
            throw new Error("No spin attempts available");
        }

        const config = await getSpinWheelConfig();
        const segments = config.segments || [];

        // Random spin result
        const randomIndex = Math.floor(Math.random() * segments.length);
        const result = segments[randomIndex];

        // Deduct one spin attempt
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, {
            spinAttempts: spinAttempts - 1,
            lastSpinDate: getCurrentFormattedTime()
        });

        // If user won a discount, create a voucher
        let voucherId = null;
        if (result.discount > 0) {
            voucherId = await createVoucher(user.uid, result.discount, `Spin Wheel ${result.discount}% OFF`);
        }

        return {
            success: true,
            result: result,
            voucherId: voucherId,
            remainingAttempts: spinAttempts - 1
        };
    } catch (error) {
        console.error("Error spinning wheel:", error);
        throw error;
    }
};

// Create a voucher for the user
export const createVoucher = async (userId, discountPercentage, description) => {
    try {
        const db = getDatabase();
        const vouchersRef = ref(db, "vouchers");

        const voucher = {
            userId: userId,
            discountPercentage: discountPercentage,
            description: description,
            isUsed: false,
            createdAt: getCurrentFormattedTime(),
            expiresAt: getExpirationDate(30), // 30 days from now
            code: generateVoucherCode()
        };

        const newVoucherRef = push(vouchersRef);
        await set(newVoucherRef, voucher);

        return newVoucherRef.key;
    } catch (error) {
        console.error("Error creating voucher:", error);
        throw error;
    }
};

// Get user's vouchers
export const getUserVouchers = async (userId = null) => {
    try {
        const user = auth.currentUser;
        const targetUserId = userId || user?.uid;

        if (!targetUserId) throw new Error("User must be logged in");

        const db = getDatabase();
        const vouchersRef = ref(db, "vouchers");
        const userVouchersQuery = query(
            vouchersRef,
            orderByChild("userId"),
            equalTo(targetUserId)
        );

        const snapshot = await get(userVouchersQuery);

        if (!snapshot.exists()) return [];

        const vouchers = [];
        snapshot.forEach((childSnapshot) => {
            const voucher = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };

            // Check if voucher is expired
            const isExpired = new Date(voucher.expiresAt) < new Date();
            voucher.isExpired = isExpired;

            vouchers.push(voucher);
        });

        // Sort by creation date (newest first)
        return vouchers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Error getting user vouchers:", error);
        throw error;
    }
};

// Use/apply a voucher
export const useVoucher = async (voucherId, orderId) => {
    try {
        const db = getDatabase();
        const voucherRef = ref(db, `vouchers/${voucherId}`);

        const snapshot = await get(voucherRef);
        if (!snapshot.exists()) {
            throw new Error("Voucher not found");
        }

        const voucher = snapshot.val();

        // Check if voucher is already used
        if (voucher.isUsed) {
            throw new Error("Voucher has already been used");
        }

        // Check if voucher is expired
        if (new Date(voucher.expiresAt) < new Date()) {
            throw new Error("Voucher has expired");
        }

        // Mark voucher as used
        await update(voucherRef, {
            isUsed: true,
            usedAt: getCurrentFormattedTime(),
            usedForOrderId: orderId
        });

        return {
            success: true,
            discountPercentage: voucher.discountPercentage,
            message: `${voucher.discountPercentage}% discount applied successfully`
        };
    } catch (error) {
        console.error("Error using voucher:", error);
        throw error;
    }
};

// Helper function to generate voucher code
const generateVoucherCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const deleteVoucher = async (voucherIds) => {
    try {
        const db = getDatabase();
        const idsToDelete = Array.isArray(voucherIds) ? voucherIds : [voucherIds]; // Ensure it's an array

        const results = await Promise.all(
            idsToDelete.map(async (voucherId) => {
                const voucherRef = ref(db, `vouchers/${voucherId}`);
                await remove(voucherRef);
                return { voucherId, success: true, message: "Voucher deleted successfully." };
            })
        );
        return { success: true, results, message: "Voucher(s) deletion process complete." };
    } catch (error) {
        console.error("Error deleting voucher(s):", error);
        throw error;
    }
};
export const unuseVoucher = async (voucherIds) => { // Now accepts voucherIds (single ID or array)
    try {
        const db = getDatabase();
        const idsToUnuse = Array.isArray(voucherIds) ? voucherIds : [voucherIds]; // Ensure it's an array

        const results = await Promise.all(
            idsToUnuse.map(async (voucherId) => {
                const voucherRef = ref(db, `vouchers/${voucherId}`);
                const snapshot = await get(voucherRef);

                if (!snapshot.exists()) {
                    return { voucherId, success: false, message: "Voucher not found." };
                }

                const voucher = snapshot.val();
                if (!voucher.isUsed) {
                    return { voucherId, success: true, message: "Voucher is already unused." };
                }

                await update(voucherRef, {
                    isUsed: false,
                    usedAt: null, // Clear used timestamp
                    usedForOrderId: null // Clear associated order ID
                });
                return { voucherId, success: true, message: "Voucher returned successfully." };
            })
        );
        return { success: true, results, message: "Voucher(s) return process complete." };
    } catch (error) {
        console.error("Error un-using voucher(s):", error);
        throw error;
    }
};


// Helper function to get expiration date
const getExpirationDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0] + ' 23:59:59';
};