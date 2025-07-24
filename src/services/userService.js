import { ref, set, get, update, remove, push, query, orderByChild, equalTo, onValue, off } from "firebase/database";
import { auth } from "../firebase/firebase";
import { database } from '../firebase/firebase';

const usersRef = ref(database, "users");

// Create a new user
export const createUser = async (userData) => {
    try {
        const newUserRef = push(usersRef);
        const timestamp = new Date().toISOString();

        await set(newUserRef, {
            ...userData,
            createdAt: timestamp,
            updatedAt: timestamp,
            createdBy: auth.currentUser?.uid || "unknown"
        });

        return { id: newUserRef.key, ...userData };
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

// Get a specific user by ID
export const getUserById = async (userId) => {
    try {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            return { id: userId, ...snapshot.val() };
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

// Get all users
export const getAllUsers = async () => {
    try {
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const users = [];
            snapshot.forEach((childSnapshot) => {
                users.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return users;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

// Update a user
export const updateUser = async (userId, userData) => {
    try {
        const userRef = ref(database, `users/${userId}`);

        // Create update object with new timestamp
        const updates = {
            ...userData,
            updatedAt: new Date().toISOString(),
        };

        await update(userRef, updates);
        return { id: userId, ...updates };
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};

// Delete a user
export const deleteUser = async (userId) => {
    try {
        const userRef = ref(database, `users/${userId}`);
        await remove(userRef);
        return userId;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

// Search users by field
export const searchUsersByField = async (field, value) => {
    try {
        const userQuery = query(usersRef, orderByChild(field), equalTo(value));
        const snapshot = await get(userQuery);

        if (snapshot.exists()) {
            const users = [];
            snapshot.forEach((childSnapshot) => {
                users.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return users;
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error searching users by ${field}:`, error);
        throw error;
    }
};

export const changeUserRoleById = async (userId, newRole) => {
    // Validate the role parameter
    if (!["customer", "staff", "admin"].includes(newRole)) {
        throw new Error("Invalid role. Role must be 'customer', 'staff', or 'admin'");
    }

    try {
        const userRef = ref(database, `users/${userId}`);

        // First check if the user exists
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Format current date as YYYY-MM-DD HH:MM:SS
        const now = new Date();
        const formattedDate = now.toISOString();

        // Update the user's role
        await update(userRef, {
            role: newRole,
            updatedAt: formattedDate,
            updatedBy: "lanceballicud"
        });

        return {
            success: true,
            message: `User ${userId} role changed to ${newRole}`,
            userId,
            newRole
        };
    } catch (error) {
        console.error("Error changing user role:", error);
        throw error;
    }
}


// Real-time users listener
export const subscribeToUsers = (callback) => {
    onValue(usersRef, (snapshot) => {
        const users = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                users.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
        }
        callback(users);
    });

    // Return unsubscribe function
    return () => off(usersRef);
};