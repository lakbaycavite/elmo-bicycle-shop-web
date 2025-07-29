// src/notifications/components/NotificationModal.jsx
import React from 'react';
import { X, CheckCircle, Trash2 } from 'lucide-react'; // Added CheckCircle for mark as read/dismiss
import { useNotifications } from '../hooks/useNotification';

function NotificationModal({ isOpen, onClose }) {
    const { notifications, unreadCount, loading, error, markAllGlobalAsRead, dismissGlobalNotification, markAsRead, remove } = useNotifications();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-4 relative max-h-[80vh] flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                    aria-label="Close notifications"
                >
                    <X size={24} />
                </button>

                <h3 className="text-xl font-bold mb-4 border-b pb-2">Notifications ({unreadCount} unread)</h3>

                {loading && <p className="text-center text-gray-600">Loading notifications...</p>}
                {error && <p className="text-center text-red-600">Error: {error}</p>}
                {!loading && !error && notifications.length === 0 && (
                    <p className="text-center text-gray-600">No notifications yet.</p>
                )}

                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {!loading && !error && notifications.length > 0 && (
                        <div>
                            {notifications.map(notif => (
                                <div key={notif.id} className="p-3 mb-2 bg-gray-50 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-gray-900 flex justify-between items-center">
                                        {notif.title}
                                        <span className="text-xs text-gray-500 ml-2">
                                            {new Date(notif.timestamp).toLocaleString()}
                                        </span>
                                    </h4>
                                    <p className="text-sm text-gray-700 mt-1">{notif.message}</p>
                                    {/* {notif.link && (
                                        <a
                                            href={notif.link}
                                            onClick={onClose} // Close modal when clicking link
                                            className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                                        >
                                            View Details
                                        </a>
                                    )} */}

                                    {/* Action Buttons for individual notifications */}
                                    <div className="mt-2 flex justify-end space-x-2">
                                        {/* Mark as Read button (only for user-specific notifications) */}
                                        {notif.type !== 'new_product' && notif.type !== 'discount_update' && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full bg-white hover:bg-gray-100 flex items-center"
                                                title="Mark as Read"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}

                                        {/* Unified Dismiss/Remove Button */}
                                        {/* This button will perform dismiss for global types, and remove for user-specific */}
                                        <button
                                            onClick={() => {
                                                if (notif.type === 'new_product' || notif.type === 'discount_update') {
                                                    dismissGlobalNotification(notif.id);
                                                } else {
                                                    remove(notif.id);
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full bg-white hover:bg-red-100 flex items-center"
                                            title={notif.type === 'new_product' || notif.type === 'discount_update' ? "Dismiss" : "Remove"}
                                        >
                                            <Trash2 size={18} />
                                            <span className="ml-1 text-sm">
                                                {notif.type === 'new_product' || notif.type === 'discount_update' ? "Dismiss" : "Remove"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {unreadCount > 0 && ( // Only show if there are unread notifications (globally or user-specific)
                    <button
                        onClick={markAllGlobalAsRead} // This only marks global ones as read (by timestamp)
                        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Mark All as Read
                    </button>
                )}
            </div>
        </div>
    );
}

export default NotificationModal;