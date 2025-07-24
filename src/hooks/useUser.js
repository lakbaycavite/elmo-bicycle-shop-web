import { useState, useEffect, useCallback } from "react";
import {
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    searchUsersByField,
    subscribeToUsers,
    changeUserRoleById
} from "../services/userService";

export const useUsers = (initialUserId = null) => {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load all users
    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllUsers();
            setUsers(data);
            console.log('Loaded users:', data);
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Load a specific user
    const loadUser = useCallback(async (id) => {
        if (!id) return null;

        setLoading(true);
        setError(null);
        try {
            const data = await getUserById(id);
            setUser(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Add a new customer
    // if adding a new customer, use the doCreateUserWithEmailAndPassword function from auth.js



    // disregard this function as it is not used in the current context
    //
    // const addCustomer = useCallback(async (customerData) => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const newCustomer = await createCustomer(customerData);
    //         setCustomers(prev => [...prev, newCustomer]);
    //         return newCustomer;
    //     } catch (err) {
    //         setError(err.message);
    //         throw err;
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

    // Update a user
    const editUser = useCallback(async (id, userData) => {
        setLoading(true);
        setError(null);
        try {
            const updatedUser = await updateUser(id, userData);
            setUsers(prev =>
                prev.map(u => u.id === id ? { ...u, ...updatedUser } : u)
            );
            if (user && user.id === id) {
                setUser({ ...user, ...updatedUser });
            }
            return updatedUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Delete a user
    const removeUser = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            if (user && user.id === id) {
                setUser(null);
            }
            return id;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Search users
    const searchUsers = useCallback(async (field, value) => {
        setLoading(true);
        setError(null);
        try {
            const results = await searchUsersByField(field, value);
            return results;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const changeRole = useCallback(async (userId, newRole) => {
        setLoading(true);
        setError(null);
        try {
            const result = await changeUserRoleById(userId, newRole);

            // Update the local state if we have users loaded
            if (users.length > 0) {
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId ? { ...user, role: newRole } : user
                    )
                );
            }

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [users]);

    // Real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToUsers((data) => {
            setUsers(data);

            // If we're tracking a specific user, update it too
            if (user) {
                const updatedUser = data.find(u => u.id === user.id);
                if (updatedUser) {
                    setUser(updatedUser);
                }
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Load initial user if ID is provided
    useEffect(() => {
        if (initialUserId) {
            loadUser(initialUserId);
        }
    }, [initialUserId, loadUser]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    return {
        users,
        user,
        loading,
        error,
        loadUsers,
        loadUser,
        // addUser,
        editUser,
        removeUser,
        searchUsers,
        changeRole
    };
};