import { useState, useEffect, useCallback } from "react";
import {
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    searchUsersByField,
    subscribeToUsers,
    changeUserRoleById,
    getCurrentUserData
} from "../services/userService";
import { auth, database } from "../firebase/firebase";
import { get, ref } from "firebase/database";
import { toast } from "sonner";


export const useUsers = (initialUserId = null) => {

    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(null);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            const user = auth.currentUser;
            if (user) {
                try {

                    const userRef = ref(database, `users/${user.uid}`);
                    const userSnapshot = await get(userRef);

                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.val();
                        if (userData.role === 'admin' || userData.role === 'staff') {
                            setIsAdmin(true);
                            return;
                        }
                    }

                    const isAdminEmail = user.email === 'admin@elmo.com';
                    setIsAdmin(isAdminEmail);

                } catch (error) {
                    console.error("Error checking admin status:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, []);
    // Load all users
    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!isAdmin) return;

        try {
            const data = await getAllUsers();
            setUsers(data);
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    async function getUserProfile() {
        const userData = await getCurrentUserData();

        if (userData) {
            setCurrentUserData(userData);
            return userData;
        }
        else {
            console.error("No user data found");
            setCurrentUserData(null);
            return null;
        }
    }

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
            toast.success('User updated successfully');
        }
    }, [user]);

    // Delete a user
    const removeUser = useCallback(async (id) => {
        // the email in the real time database is removed but in the authentication is still there.
        // backend and firebase sdk needed to be updated to remove the user from authentication as well.
        setLoading(true);
        setError(null);
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            if (user && user.id === id) {
                setUser(null);
            }
            toast.success('User deleted successfully');
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
            const result = await changeUserRoleById(userId, newRole)

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

    useEffect(() => {
        getUserProfile();
    }, []);

    return {
        users,
        user,
        currentUserData,
        loading,
        error,
        loadUsers,
        loadUser,
        getUserProfile,
        editUser,
        removeUser,
        searchUsers,
        changeRole
    };
};