import { getAuth } from 'firebase/auth';
import { getDatabase, ref, update, get, push, serverTimestamp } from 'firebase/database';

/**
 * Service for managing user status in Firebase
 * @param {Object} app - Firebase app instance
 * @returns {Object} User status management methods
 */
export function createUserStatusService(app) {
    const auth = getAuth(app);
    const database = getDatabase(app);

    /**
     * Disables a user in both Firebase Authentication and Realtime Database
     * @param {Object} params - Parameters for disabling user
     * @param {string} params.uid - User ID to disable
     * @param {string} params.adminUser - Username of admin performing the action (e.g. 'lanceballicud')
     * @param {string} params.reason - Reason for disabling the user
     * @param {string} params.timestamp - Timestamp for the action (e.g. '2025-07-26 06:08:36')
     */
    const disableUser = async ({ uid, adminUser, reason, timestamp }) => {
        try {
            // Disable user in Firebase Authentication
            await auth.updateUser(uid, {
                disabled: true
            });

            // Format timestamp if not provided
            const formattedTimestamp = timestamp || '2025-07-26 06:08:36';

            // Create status change record
            const statusChange = {
                status: 'disabled',
                timestamp: serverTimestamp(),
                recordedAt: formattedTimestamp,
                by: adminUser || 'lanceballicud',
                reason: reason || 'No reason provided'
            };

            // Update user record in database
            await update(ref(database, `users/${uid}`), {
                accountStatus: 'disabled',
                disabledAt: formattedTimestamp,
                disabledBy: adminUser || 'lanceballicud',
                disabledReason: reason || 'No reason provided',
                lastStatusChange: statusChange
            });

            // Add to status history
            await push(ref(database, `users/${uid}/statusHistory`), statusChange);

            console.log(`User ${uid} disabled at ${formattedTimestamp} by ${adminUser || 'lanceballicud'}`);
            return true;
        } catch (error) {
            console.error('Error disabling user:', error);
            throw error;
        }
    };

    /**
     * Reactivates a user in both Firebase Authentication and Realtime Database
     * @param {Object} params - Parameters for reactivating user
     * @param {string} params.uid - User ID to reactivate
     * @param {string} params.adminUser - Username of admin performing the action (e.g. 'lanceballicud')
     * @param {string} params.reason - Reason for reactivating the user
     * @param {string} params.timestamp - Timestamp for the action (e.g. '2025-07-26 06:08:36')
     */
    const reactivateUser = async ({ uid, adminUser, reason, timestamp }) => {
        try {
            // Enable user in Firebase Authentication
            await auth.updateUser(uid, {
                disabled: false
            });

            // Format timestamp if not provided
            const formattedTimestamp = timestamp || '2025-07-26 06:08:36';

            // Create status change record
            const statusChange = {
                status: 'active',
                timestamp: serverTimestamp(),
                recordedAt: formattedTimestamp,
                by: adminUser || 'lanceballicud',
                reason: reason || 'Administrative reactivation'
            };

            // Update user record in database
            await update(ref(database, `users/${uid}`), {
                accountStatus: 'active',
                reactivatedAt: formattedTimestamp,
                reactivatedBy: adminUser || 'lanceballicud',
                reactivatedReason: reason || 'Administrative reactivation',
                lastStatusChange: statusChange
            });

            // Add to status history
            await push(ref(database, `users/${uid}/statusHistory`), statusChange);

            console.log(`User ${uid} reactivated at ${formattedTimestamp} by ${adminUser || 'lanceballicud'}`);
            return true;
        } catch (error) {
            console.error('Error reactivating user:', error);
            throw error;
        }
    };

    /**
     * Checks if a user is disabled in the database
     * @param {string} uid - User ID to check
     * @returns {Promise<boolean>} Whether the user is disabled
     */
    const isUserDisabled = async (uid) => {
        try {
            const snapshot = await get(ref(database, `users/${uid}/accountStatus`));
            return snapshot.exists() && snapshot.val() === 'disabled';
        } catch (error) {
            console.error('Error checking user status:', error);
            throw error;
        }
    };

    /**
     * Gets a user's status history
     * @param {string} uid - User ID to get history for
     * @returns {Promise<Array>} Array of status history items
     */
    const getUserStatusHistory = async (uid) => {
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
            return history.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Error getting user status history:', error);
            throw error;
        }
    };

    return {
        disableUser,
        reactivateUser,
        isUserDisabled,
        getUserStatusHistory
    };
}