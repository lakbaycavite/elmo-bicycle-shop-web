// src/services/notificationService.js
import { getDatabase, ref, push, set, update, remove } from 'firebase/database';
// If you're using ServerValue.TIMESTAMP with a Cloud Function, you'd import it like this:
// import { ServerValue } from 'firebase/database';

const db = getDatabase();

/**
 * Adds a new notification to the global feed visible to all users.
 * This is typically triggered by an admin action (e.g., new product, site announcement).
 * @param {object} notificationData - The data for the global notification (title, message, type, link).
 * @returns {Promise<void>}
 */
export const addGlobalNotification = async (notificationData) => {
    const globalNotificationsRef = ref(db, `global_notifications`);
    const newNotificationRef = push(globalNotificationsRef); // Generates a unique ID
    return set(newNotificationRef, {
        ...notificationData,
        // Use Date.now() for client-side timestamp.
        // For production with Cloud Functions, consider ServerValue.TIMESTAMP for server-side accuracy.
        timestamp: Date.now(),
    });
};

/**
 * Adds a new notification specific to a single user.
 * This is for personalized notifications (e.g., order updates, direct messages).
 * @param {string} userId - The UID of the user to receive the notification.
 * @param {object} notificationData - The data for the user-specific notification (title, message, type, link).
 * @returns {Promise<void>}
 */
export const addUserNotification = async (userId, notificationData) => {
    if (!userId) {
        console.error("addUserNotification: No userId provided.");
        return;
    }
    const notificationsRef = ref(db, `notifications/${userId}`);
    const newNotificationRef = push(notificationsRef); // Generates a unique ID
    return set(newNotificationRef, {
        ...notificationData,
        timestamp: Date.now(),
        read: false, // User-specific notifications have a 'read' status
    });
};

/**
 * Marks a specific user-specific notification as read.
 * @param {string} userId - The UID of the user whose notification is being marked.
 * @param {string} notificationId - The ID of the notification to mark as read.
 * @returns {Promise<void>}
 */
export const markUserNotificationAsRead = async (userId, notificationId) => {
    if (!userId || !notificationId) {
        console.warn("markUserNotificationAsRead: Missing userId or notificationId.");
        return;
    }
    const notificationRef = ref(db, `notifications/${userId}/${notificationId}`);
    return update(notificationRef, { read: true });
};

/**
 * Removes a specific user-specific notification.
 * @param {string} userId - The UID of the user whose notification is being removed.
 * @param {string} notificationId - The ID of the notification to remove.
 * @returns {Promise<void>}
 */
export const removeUserNotification = async (userId, notificationId) => {
    if (!userId || !notificationId) {
        console.warn("removeUserNotification: Missing userId or notificationId.");
        return;
    }
    const notificationRef = ref(db, `notifications/${userId}/${notificationId}`);
    return remove(notificationRef);
};

/**
 * Dismisses a global notification for a specific user.
 * This marks the notification as "seen" or "dismissed" for that user without deleting it for others.
 * @param {string} userId - The UID of the user dismissing the notification.
 * @param {string} notificationId - The ID of the global notification being dismissed.
 * @returns {Promise<void>}
 */
export const dismissGlobalNotificationForUser = async (userId, notificationId) => {
    if (!userId || !notificationId) {
        console.warn("dismissGlobalNotificationForUser: Missing userId or notificationId.");
        return;
    }
    const userDismissedNotificationsRef = ref(db, `users/${userId}/notificationSettings/dismissedGlobalNotifications/${notificationId}`);
    return set(userDismissedNotificationsRef, true); // Set to true to mark as dismissed
};

/**
 * Updates the last timestamp a user read global notifications.
 * This effectively marks all global notifications older than this timestamp as "read" for the user.
 * @param {string} userId - The UID of the user.
 * @returns {Promise<void>}
 */
export const markAllGlobalAsReadInDB = async (userId) => {
    if (!userId) {
        console.warn("markAllGlobalAsReadInDB: Missing userId.");
        return;
    }
    const userSettingsRef = ref(db, `users/${userId}/notificationSettings/lastReadGlobalTimestamp`);
    return set(userSettingsRef, Date.now());
};

// Removed redundant `markNotificationAsRead` (use `markUserNotificationAsRead` instead)
// Removed redundant `addNotification` (use `addUserNotification` instead)
// Removed general `removeNotification` (use `removeUserNotification` instead)