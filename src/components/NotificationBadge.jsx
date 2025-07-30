// src/notifications/components/NotificationBadge.jsx
import React from 'react';
import { useNotifications } from '../hooks/useNotification'; 
import { Bell } from 'lucide-react';

function NotificationBadge() {
    const { unreadCount, loading, error } = useNotifications();

    if (loading || error) {
        return <Bell size={24} className="text-white" />;
    }

    return (
        <div className="relative">
            <Bell size={24} className="text-white" />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                </span>
            )}
        </div>
    );
}

export default NotificationBadge;