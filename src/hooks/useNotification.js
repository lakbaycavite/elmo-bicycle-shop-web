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

    const getActiveNotifications = useCallback(() => {
        const user = auth.currentUser;

        const activeGlobalForDisplay = [...globalNotifications]; // Simply return all global notifications

        const activeUserSpecific = user ? userSpecificNotifications.filter(notif => !notif.read) : [];

        const combined = [...activeGlobalForDisplay, ...activeUserSpecific];
        combined.sort((a, b) => b.timestamp - a.timestamp); // Sort newest first
        return combined;
    }, [globalNotifications, userSpecificNotifications, auth.currentUser]); // Removed lastReadGlobalTimestamp, dismissedGlobalIds from deps

    const calculateUnreadCount = useCallback(() => {
        const user = auth.currentUser;
        if (!user) {
            return globalNotifications.length;
        }

        const unreadGlobal = globalNotifications.filter(notif => {
            const isReadByTimestamp = notif.timestamp <= lastReadGlobalTimestamp;
            const isDismissed = dismissedGlobalIds[notif.id];
            return !isReadByTimestamp && !isDismissed;
        });

        const unreadUserSpecific = userSpecificNotifications.filter(notif => !notif.read);

        return unreadGlobal.length + unreadUserSpecific.length;
    }, [globalNotifications, userSpecificNotifications, lastReadGlobalTimestamp, dismissedGlobalIds, auth.currentUser]);


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