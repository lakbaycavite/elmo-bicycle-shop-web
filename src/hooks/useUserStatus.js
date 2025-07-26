import { useState, useCallback } from 'react';
import { ref, update, get, push, serverTimestamp } from 'firebase/database';
import { database } from "../firebase/firebase";

/**
 * Hook for managing user status in Firebase
 * @param {Object} config - Configuration object
 * @param {string} config.currentUserLogin - Current admin username (default: 'lanceballicud')
 * @param {string} config.currentDateTime - Current date/time (default: '2025-07-26 06:17:23')
 * @returns {Object} - User status management methods and state
 */
export function useUserStatus(config = {}) {
    const currentUserLogin = config.currentUserLogin || 'lanceballicud';
    const currentDateTime = config.currentDateTime || '2025-07-26 06:17:23';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Disables a user account (database only)
     * Note: This does not disable Firebase Authentication
     */
    const disableUser = useCallback(async ({ uid, reason }) => {
        setLoading(true);
        setError(null);

        try {
            // Create status change record
            const statusChange = {
                status: 'disabled',
                timestamp: serverTimestamp(),
                recordedAt: currentDateTime,
                by: currentUserLogin,
                reason: reason || 'No reason provided'
            };

            // Update in Realtime Database - only updating status fields
            await update(ref(database, `users/${uid}`), {
                accountStatus: 'disabled',
                disabledAt: currentDateTime,
                disabledBy: currentUserLogin,
                disabledReason: reason || 'No reason provided',
                lastStatusChange: statusChange
            });
            
            // Add to status history
            // await push(ref(database, `users/${uid}/statusHistory`), statusChange);

            console.log(`User ${uid} disabled at ${currentDateTime} by ${currentUserLogin}`);
            return true;
        } catch (err) {
            console.error('Error disabling user:', err);
            setError(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentUserLogin, currentDateTime]);

    /**
     * Reactivates a previously disabled user account (database only)
     * Note: This does not reactivate Firebase Authentication
     */
    const reactivateUser = useCallback(async ({ uid, reason }) => {
        setLoading(true);
        setError(null);

        try {
            // Create status change record
            const statusChange = {
                status: 'active',
                timestamp: serverTimestamp(),
                recordedAt: currentDateTime,
                by: currentUserLogin,
                reason: reason || 'Administrative reactivation'
            };

            // Update in Realtime Database - only updating status fields
            await update(ref(database, `users/${uid}`), {
                accountStatus: 'active',
                reactivatedAt: currentDateTime,
                reactivatedBy: currentUserLogin,
                reactivatedReason: reason || 'Administrative reactivation',
                lastStatusChange: statusChange
            });

            // Add to status history
            await push(ref(database, `users/${uid}/statusHistory`), statusChange);

            console.log(`User ${uid} reactivated at ${currentDateTime} by ${currentUserLogin}`);
            return true;
        } catch (err) {
            console.error('Error reactivating user:', err);
            setError(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentUserLogin, currentDateTime]);

    /**
     * Checks if a user is disabled
     */
    const isUserDisabled = useCallback(async (uid) => {
        try {
            const snapshot = await get(ref(database, `users/${uid}/accountStatus`));
            return snapshot.exists() && snapshot.val() === 'disabled';
        } catch (err) {
            console.error('Error checking user status:', err);
            setError(err);
            return false;
        }
    }, []);

    /**
     * Gets a user's status history
     */
    const getUserStatusHistory = useCallback(async (uid) => {
        try {
            const snapshot = await get(ref(database, `users/${uid}/statusHistory`));

            if (!snapshot.exists()) {
                return [];
            }

            const history = [];
            snapshot.forEach((childSnapshot) => {
                history.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // Sort by timestamp (newest first)
            return history.sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return b.timestamp - a.timestamp;
            });
        } catch (err) {
            console.error('Error getting user status history:', err);
            setError(err);
            return [];
        }
    }, []);

    return {
        disableUser,
        reactivateUser,
        isUserDisabled,
        getUserStatusHistory,
        loading,
        error
    };
}