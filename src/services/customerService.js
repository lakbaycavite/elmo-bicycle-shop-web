import { ref, set, get, update, remove, push, query, orderByChild, equalTo, onValue, off } from "firebase/database";
import { auth } from "../firebase/firebase";
import { database } from '../firebase/firebase';


const customersRef = ref(database, "customers");

// Create a new customer
export const createCustomer = async (customerData) => {
    try {
        const newCustomerRef = push(customersRef);
        const timestamp = new Date().toISOString();

        await set(newCustomerRef, {
            ...customerData,
            createdAt: timestamp,
            updatedAt: timestamp,
            createdBy: auth.currentUser?.uid || "unknown"
        });

        return { id: newCustomerRef.key, ...customerData };
    } catch (error) {
        console.error("Error creating customer:", error);
        throw error;
    }
};

// Get a specific customer by ID
export const getCustomerById = async (customerId) => {
    try {
        const customerRef = ref(database, `customers/${customerId}`);
        const snapshot = await get(customerRef);

        if (snapshot.exists()) {
            return { id: customerId, ...snapshot.val() };
        } else {
            throw new Error("Customer not found");
        }
    } catch (error) {
        console.error("Error fetching customer:", error);
        throw error;
    }
};

// Get all customers
export const getAllCustomers = async () => {
    try {
        const snapshot = await get(customersRef);

        if (snapshot.exists()) {
            const customers = [];
            snapshot.forEach((childSnapshot) => {
                customers.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return customers;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching customers:", error);
        throw error;
    }
};

// Update a customer
export const updateCustomer = async (customerId, customerData) => {
    try {
        const customerRef = ref(database, `customers/${customerId}`);

        // Create update object with new timestamp
        const updates = {
            ...customerData,
            updatedAt: new Date().toISOString(),
            updatedBy: auth.currentUser?.uid || "unknown"
        };

        await update(customerRef, updates);
        return { id: customerId, ...updates };
    } catch (error) {
        console.error("Error updating customer:", error);
        throw error;
    }
};

// Delete a customer
export const deleteCustomer = async (customerId) => {
    try {
        const customerRef = ref(database, `customers/${customerId}`);
        await remove(customerRef);
        return customerId;
    } catch (error) {
        console.error("Error deleting customer:", error);
        throw error;
    }
};

// Search customers by field
export const searchCustomersByField = async (field, value) => {
    try {
        const customerQuery = query(customersRef, orderByChild(field), equalTo(value));
        const snapshot = await get(customerQuery);

        if (snapshot.exists()) {
            const customers = [];
            snapshot.forEach((childSnapshot) => {
                customers.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return customers;
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error searching customers by ${field}:`, error);
        throw error;
    }
};

// Real-time customers listener
export const subscribeToCustomers = (callback) => {
    onValue(customersRef, (snapshot) => {
        const customers = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                customers.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
        }
        callback(customers);
    });

    // Return unsubscribe function
    return () => off(customersRef);
};