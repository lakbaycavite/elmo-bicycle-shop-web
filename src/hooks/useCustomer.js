import { useState, useEffect, useCallback } from "react";
import {
    createCustomer,
    getCustomerById,
    getAllCustomers,
    updateCustomer,
    deleteCustomer,
    searchCustomersByField,
    subscribeToCustomers
} from "../services/customerService";

export const useCustomers = (initialCustomerId = null) => {
    const [customers, setCustomers] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load all customers
    const loadCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllCustomers();
            setCustomers(data);
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Load a specific customer
    const loadCustomer = useCallback(async (id) => {
        if (!id) return null;

        setLoading(true);
        setError(null);
        try {
            const data = await getCustomerById(id);
            setCustomer(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Add a new customer
    const addCustomer = useCallback(async (customerData) => {
        setLoading(true);
        setError(null);
        try {
            const newCustomer = await createCustomer(customerData);
            setCustomers(prev => [...prev, newCustomer]);
            return newCustomer;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update a customer
    const editCustomer = useCallback(async (id, customerData) => {
        setLoading(true);
        setError(null);
        try {
            const updatedCustomer = await updateCustomer(id, customerData);
            setCustomers(prev =>
                prev.map(c => c.id === id ? { ...c, ...updatedCustomer } : c)
            );
            if (customer && customer.id === id) {
                setCustomer({ ...customer, ...updatedCustomer });
            }
            return updatedCustomer;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [customer]);

    // Delete a customer
    const removeCustomer = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteCustomer(id);
            setCustomers(prev => prev.filter(c => c.id !== id));
            if (customer && customer.id === id) {
                setCustomer(null);
            }
            return id;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [customer]);

    // Search customers
    const searchCustomers = useCallback(async (field, value) => {
        setLoading(true);
        setError(null);
        try {
            const results = await searchCustomersByField(field, value);
            return results;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToCustomers((data) => {
            setCustomers(data);

            // If we're tracking a specific customer, update it too
            if (customer) {
                const updatedCustomer = data.find(c => c.id === customer.id);
                if (updatedCustomer) {
                    setCustomer(updatedCustomer);
                }
            }
        });

        return () => unsubscribe();
    }, [customer]);

    // Load initial customer if ID is provided
    useEffect(() => {
        if (initialCustomerId) {
            loadCustomer(initialCustomerId);
        }
    }, [initialCustomerId, loadCustomer]);

    return {
        customers,
        customer,
        loading,
        error,
        loadCustomers,
        loadCustomer,
        addCustomer,
        editCustomer,
        removeCustomer,
        searchCustomers
    };
};