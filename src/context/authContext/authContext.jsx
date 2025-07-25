import React, { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./createAuthContext";
import { getUserById } from '../../services/userService';

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, [])

    async function initializeUser(user) {
        if (user) {
            console.log("User is logged in:", user.email);
            setCurrentUser({ ...user });
            setUserLoggedIn(true);
            // Fetch user record from DB
            try {
                const userRecord = await getUserById(user.uid);
                setRole(userRecord.role || 'customer');
            } catch (err) {
                console.error('Failed to fetch user record for context:', err);
                setRole('customer');
            }
        }
        else {
            setCurrentUser(null);
            setUserLoggedIn(false);
            setRole(null);
        }
        setLoading(false);
    }

    const value = {
        currentUser,
        userLoggedIn,
        role,
        loading,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
