// src/notifications/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue, off, query, orderByChild } from 'firebase/database';
import { auth } from '../firebase/firebase';

// Import all necessary service functions
import {
    markUserNotificationAsRead,
    removeUserNotification,
    dismissGlobalNotificationForUser,
    markAllGlobalAsReadInDB
} from '../services/notificationService';

export function useNotifications() {
    const [globalNotifications, setGlobalNotifications] = useState([]);
    const [userSpecificNotifications, setUserSpecificNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [lastReadGlobalTimestamp, setLastReadGlobalTimestamp] = useState(0);
    const [dismissedGlobalIds, setDismissedGlobalIds] = useState({});

    useEffect(() => {
        const db = getDatabase();
        const user = auth.currentUser;

        let unsubscribeGlobal;
        let unsubscribeUserGlobalSettings;
        let unsubscribeUserSpecificNotifications;

        let userSettingsRef;
        let userNotificationsRef;

        // --- GLOBAL NOTIFICATIONS LISTENER (Always active) ---
        const globalNotificationsRef = query(ref(db, `global_notifications`), orderByChild('timestamp'));
        unsubscribeGlobal = onValue(globalNotificationsRef, (snapshot) => {
            try {
                const notificationsData = snapshot.val();
                if (notificationsData) {
                    const loadedNotifications = Object.keys(notificationsData).map(key => ({
                        id: key,
                        ...notificationsData[key]
                    }));
                    loadedNotifications.sort((a, b) => b.timestamp - a.timestamp);
                    setGlobalNotifications(loadedNotifications);
                } else {
                    setGlobalNotifications([]);
                }
                setError(null);
            } catch (err) {
                console.error("Error fetching global notifications:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }, (err) => {
            console.error("Firebase global notification listener error:", err);
            setError(err.message);
            setLoading(false);
        });

        // --- USER-SPECIFIC DATA LISTENERS (Only active if user is logged in) ---
        if (user) {
            userSettingsRef = ref(db, `users/${user.uid}/notificationSettings`);
            unsubscribeUserGlobalSettings = onValue(userSettingsRef, (snapshot) => {
                const settings = snapshot.val();
                if (settings) {
                    setLastReadGlobalTimestamp(settings.lastReadGlobalTimestamp || 0);
                    setDismissedGlobalIds(settings.dismissedGlobalNotifications || {});
                } else {
                    setLastReadGlobalTimestamp(0);
                    setDismissedGlobalIds({});
                }
            }, (err) => console.error("Error reading user global notification settings:", err));

            // --- USER-SPECIFIC NOTIFICATIONS LISTENER (Uncomment if needed) ---
            /*
            userNotificationsRef = ref(db, `notifications/${user.uid}`);
            unsubscribeUserSpecificNotifications = onValue(userNotificationsRef, (snapshot) => {
                const notificationsData = snapshot.val();
                if (notificationsData) {
                    const loadedNotifications = Object.keys(notificationsData).map(key => ({
                        id: key,
                        ...notificationsData[key]
                    }));
                    setUserSpecificNotifications(loadedNotifications.filter(notif => !notif.read));
                } else {
                    setUserSpecificNotifications([]);
                }
            }, (err) => console.error("Error fetching user-specific notifications:", err));
            */
        } else {
            // If no user, reset user-specific states (important for unreadCount calculation)
            setLastReadGlobalTimestamp(0);
            setDismissedGlobalIds({});
            setUserSpecificNotifications([]);
        }

        return () => {
            if (unsubscribeGlobal) off(globalNotificationsRef, 'value', unsubscribeGlobal);
            if (unsubscribeUserGlobalSettings && userSettingsRef) {
                off(userSettingsRef, 'value', unsubscribeUserGlobalSettings);
            }
            if (unsubscribeUserSpecificNotifications && userNotificationsRef) {
                off(userNotificationsRef, 'value', unsubscribeUserSpecificNotifications);
            }
        };
    }, [auth.currentUser]);

    // --- REFACTORED getActiveNotifications ---
    const getActiveNotifications = useCallback(() => {
        const user = auth.currentUser;

        // Global notifications: ALWAYS include all fetched global notifications for display.
        // The filtering for 'unreadCount' will happen separately.
        const activeGlobalForDisplay = [...globalNotifications]; // Simply return all global notifications

        // User-specific notifications: Only active if a user is logged in AND they are not read
        const activeUserSpecific = user ? userSpecificNotifications.filter(notif => !notif.read) : [];

        const combined = [...activeGlobalForDisplay, ...activeUserSpecific];
        combined.sort((a, b) => b.timestamp - a.timestamp); // Sort newest first
        return combined;
    }, [globalNotifications, userSpecificNotifications, auth.currentUser]); // Removed lastReadGlobalTimestamp, dismissedGlobalIds from deps

    // --- NEW: Calculate unread count based on user's specific read/dismissed status ---
    const calculateUnreadCount = useCallback(() => {
        const user = auth.currentUser;
        if (!user) {
            // If no user logged in, all global notifications are considered unread by default
            return globalNotifications.length;
        }

        // For logged-in users, filter based on their read/dismissed settings
        const unreadGlobal = globalNotifications.filter(notif => {
            const isReadByTimestamp = notif.timestamp <= lastReadGlobalTimestamp;
            const isDismissed = dismissedGlobalIds[notif.id];
            return !isReadByTimestamp && !isDismissed;
        });

        // Unread user-specific notifications
        const unreadUserSpecific = userSpecificNotifications.filter(notif => !notif.read);

        return unreadGlobal.length + unreadUserSpecific.length;
    }, [globalNotifications, userSpecificNotifications, lastReadGlobalTimestamp, dismissedGlobalIds, auth.currentUser]);


    // Update unread count whenever relevant data changes
    useEffect(() => {
        setUnreadCount(calculateUnreadCount());
    }, [calculateUnreadCount]);

    // --- Action Functions ---

    const markAllGlobalAsRead = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) {
            console.warn("Cannot mark all global as read: No user logged in.");
            return;
        }
        try {
            await markAllGlobalAsReadInDB(user.uid);
        } catch (err) {
            console.error("Failed to mark all global notifications as read:", err);
            setError(err.message);
        }
    }, [auth.currentUser]);

    const dismissGlobalNotification = useCallback(async (notificationId) => {
        const user = auth.currentUser;
        if (!user) {
            console.warn("Cannot dismiss global notification: No user logged in.");
            return;
        }
        try {
            await dismissGlobalNotificationForUser(user.uid, notificationId);
        } catch (err) {
            console.error("Failed to dismiss global notification:", err);
            setError(err.message);
        }
    }, [auth.currentUser]);

    const markAsRead = useCallback(async (notificationId) => {
        const user = auth.currentUser;
        if (!user) {
            console.warn("Cannot mark user notification as read: No user logged in.");
            return;
        }
        try {
            await markUserNotificationAsRead(user.uid, notificationId);
        } catch (err) {
            console.error("Failed to mark user notification as read:", err);
            setError(err.message);
        }
    }, [auth.currentUser]);

    const remove = useCallback(async (notificationId) => {
        const user = auth.currentUser;
        if (!user) {
            console.warn("Cannot remove user notification: No user logged in.");
            return;
        }
        try {
            await removeUserNotification(user.uid, notificationId);
        } catch (err) {
            console.error("Failed to remove user notification:", err);
            setError(err.message);
        }
    }, [auth.currentUser]);

    return {
        notifications: getActiveNotifications(), // This now returns ALL global notifications + active user-specific
        unreadCount, // This still reflects the actual unread count
        loading,
        error,
        markAllGlobalAsRead,
        dismissGlobalNotification,
        markAsRead,
        remove
    };
}