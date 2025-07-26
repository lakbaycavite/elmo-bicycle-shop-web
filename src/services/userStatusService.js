import { getAuth } from 'firebase/auth';
import { getDatabase, ref, update, get, query, orderByChild, serverTimestamp } from 'firebase/database';

/**
 * Creates a service to manage user status in Firebase
 */
export function createUserStatusService(app) {
    const auth = getAuth(app);
    const database = getDatabase(app);

    /**
     * Disables a user in both Firebase Authentication and Realtime Database
     */
    const disableUser = async ({ uid, adminUser, reason, timestamp }) => {
        try {
            // Update in Firebase Authentication
            await auth.updateUser(uid, { disabled: true });

            // Create status history entry
            const statusChange = {
                status: 'disabled',
                timestamp: serverTimestamp(),
                by: adminUser,
                reason: reason || 'No reason provided'
            };

            // Update in Realtime Database
            await update(ref(database, `users/${uid}`), {
                accountStatus: 'disabled',
                disabledAt: timestamp || new Date().toISOString(),
                disabledBy: adminUser,
                disabledReason: reason || 'No reason provided',
                lastStatusChange: statusChange
            });

            // Add to status history
            const historyRef = ref(database, `users/${uid}/statusHistory`);
            const historySnapshot = await get(historyRef);
            const historyKey = historySnapshot.exists()
                ? Object.keys(historySnapshot.val()).length.toString()
                : '0';

            await update(ref(database, `users/${uid}/statusHistory/${historyKey}`), statusChange);

            console.log(`User ${uid} disabled successfully by ${adminUser}`);
            return true;
        } catch (error) {
            console.error('Error disabling user:', error);
            throw error;
        }
    };

    /**
     * Reactivates a user in both Firebase Authentication and Realtime Database
     */
    const reactivateUser = async ({ uid, adminUser, reason, timestamp }) => {
        try {
            // Update in Firebase Authentication
            await auth.updateUser(uid, { disabled: false });

            // Create status history entry
            const statusChange = {
                status: 'active',
                timestamp: serverTimestamp(),
                by: adminUser,
                reason: reason || 'No reason provided'
            };

            // Update in Realtime Database
            await update(ref(database, `users/${uid}`), {
                accountStatus: 'active',
                reactivatedAt: timestamp || new Date().toISOString(),
                reactivatedBy: adminUser,
                reactivatedReason: reason || 'No reason provided',
                lastStatusChange: statusChange
            });

            // Add to status history
            const historyRef = ref(database, `users/${uid}/statusHistory`);
            const historySnapshot = await get(historyRef);
            const historyKey = historySnapshot.exists()
                ? Object.keys(historySnapshot.val()).length.toString()
                : '0';

            await update(ref(database, `users/${uid}/statusHistory/${historyKey}`), statusChange);

            console.log(`User ${uid} reactivated successfully by ${adminUser}`);
            return true;
        } catch (error) {
            console.error('Error reactivating user:', error);
            throw error;
        }
    };

    /**
     * Check if a user is disabled in Realtime Database
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
     * Get user status history
     */
    const getUserStatusHistory = async (uid) => {
        try {
            const historyRef = query(
                ref(database, `users/${uid}/statusHistory`),
                orderByChild('timestamp')
            );
            const snapshot = await get(historyRef);

            if (!snapshot.exists()) {
                return [];
            }

            const history = [];
            snapshot.forEach((childSnapshot) => {
                history.push(childSnapshot.val());
            });

            return history;
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