// src/notifications/components/NotificationItem.jsx
import React from 'react';

function NotificationItem({ notification, onMarkAsRead, onRemove }) {
    const { id, title, message, timestamp, read, link } = notification;

    const handleItemClick = () => {
        onMarkAsRead(id);
        if (link) {
            // Example: navigate to internal app link
            // Depending on your router (e.g., react-router-dom)
            // history.push(link); or navigate(link)
            window.location.href = link; // Simple redirect for now
        }
    };

    return (
        <div
            className={`p-3 border-b border-gray-200 cursor-pointer ${read ? 'bg-gray-50' : 'bg-white font-semibold'}`}
            onClick={handleItemClick}
        >
            <div className="flex justify-between items-start">
                <h4 className="text-md">{title}</h4>
                <span className="text-xs text-gray-500">
                    {new Date(timestamp).toLocaleDateString()} {new Date(timestamp).toLocaleTimeString()}
                </span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{message}</p>
            {!read && (
                <button
                    className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                    onClick={(e) => { e.stopPropagation(); onMarkAsRead(id); }}
                >
                    Mark as Read
                </button>
            )}
            <button
                className="ml-2 mt-2 text-red-500 hover:text-red-700 text-sm"
                onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            >
                Remove
            </button>
        </div>
    );
}

export default NotificationItem;