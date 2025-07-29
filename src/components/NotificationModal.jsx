// src/notifications/components/NotificationModal.jsx

import React from 'react';
import { X, CheckCircle, Trash2, Bell, Clock, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../hooks/useNotification';

function NotificationModal({ isOpen, onClose }) {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        markAllGlobalAsRead,
        dismissGlobalNotification,
        markAsRead,
        remove
    } = useNotifications();

    if (!isOpen) return null;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_product':
                return <Info className="w-5 h-5 text-blue-500" />;
            case 'discount_update':
                return <AlertCircle className="w-5 h-5 text-green-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getNotificationBorder = (type) => {
        switch (type) {
            case 'new_product':
                return 'border-l-4 border-l-blue-500';
            case 'discount_update':
                return 'border-l-4 border-l-green-500';
            default:
                return 'border-l-4 border-l-gray-300';
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-orange-500">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Bell className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900" style={{ color: "black" }}>Notifications</h3>
                            <p className="text-sm text-black">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close notifications"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-600">Loading notifications...</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                <p className="text-red-600 font-medium">Error loading notifications</p>
                                <p className="text-gray-500 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && notifications.length === 0 && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h4>
                                <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && notifications.length > 0 && (
                        <div className="overflow-y-auto px-4 py-2 space-y-3" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                            {notifications.map((notif, index) => (
                                <div
                                    key={notif.id}
                                    className={`
                                        group relative bg-white border border-gray-200 rounded-xl p-4 
                                        hover:shadow-md transition-all duration-200 
                                        ${getNotificationBorder(notif.type)}
                                        ${index === 0 ? 'mt-2' : ''}
                                    `}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notif.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <h4 className="text-base font-medium text-gray-900 leading-5" style={{ color: 'black' }}>
                                                    {notif.title}
                                                </h4>
                                                <div className="flex items-center space-x-1 ml-3">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {formatTimestamp(notif.timestamp)}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 mt-1 leading-5">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-3 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Mark as Read button (only for user-specific notifications) */}
                                        {notif.type !== 'new_product' && notif.type !== 'discount_update' && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                                title="Mark as Read"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                Mark Read
                                            </button>
                                        )}

                                        {/* Uncomment if dismiss/remove functionality is needed */}
                                        {/*
                                        <button
                                            onClick={() => {
                                                if (notif.type === 'new_product' || notif.type === 'discount_update') {
                                                    dismissGlobalNotification(notif.id);
                                                } else {
                                                    remove(notif.id);
                                                }
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                            title={notif.type === 'new_product' || notif.type === 'discount_update' ? "Dismiss" : "Remove"}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                                            {notif.type === 'new_product' || notif.type === 'discount_update' ? "Dismiss" : "Remove"}
                                        </button>
                                        */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {unreadCount > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={markAllGlobalAsRead}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Mark All as Read
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationModal;