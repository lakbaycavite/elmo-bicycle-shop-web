import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useOrder } from '../../hooks/useOrder';
import { useUsers } from '../../hooks/useUser';

function Dashboard() {
  const { adminOrders } = useOrder();
  const { users } = useUsers();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get today's date info
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const currentDay = dayNames[today.getDay()];

  // Load read notifications from localStorage
  useEffect(() => {
    const savedReadIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');

    if (users.length > 0) {
      const newCustomers = users.filter(user => {
        if (user.role !== 'customer') return false;
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        const userDateStr = userDate.toISOString().split('T')[0];
        return userDateStr === todayStr;
      });

      const generatedNotifications = newCustomers.map(customer => ({
        id: customer.id,
        firstName: customer.firstName || 'New',
        lastName: customer.lastName || 'Customer',
        timestamp: new Date(),
        read: savedReadIds.includes(customer.id) // Mark as read if found in localStorage
      }));

      setNotifications(generatedNotifications);

      // Count only unread ones
      const unread = generatedNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  }, [users, todayStr]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Save to localStorage so it stays read after reload
    const savedReadIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    if (!savedReadIds.includes(id)) {
      savedReadIds.push(id);
      localStorage.setItem('readNotifications', JSON.stringify(savedReadIds));
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);

    // Save all IDs to localStorage
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('readNotifications', JSON.stringify(allIds));
  };

  // Calculate today's metrics - ONLY include paid orders in income calculation
  const todaysOrders = adminOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const orderDateStr = orderDate.toISOString().split('T')[0];
    return orderDateStr === todayStr;
  });

  // Only include paid orders in income calculation
  const paidOrders = todaysOrders.filter(order => order.status === 'paid');
  const todaysIncome = paidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const todaysOrderCount = todaysOrders.length;

  const todaysCustomers = users.filter(user => {
    if (user.role !== 'customer') return false;
    if (!user.createdAt) return false;
    const userDate = new Date(user.createdAt);
    const userDateStr = userDate.toISOString().split('T')[0];
    return userDateStr === todayStr;
  }).length;

  const getWeeklyRevenue = () => {
    const weeklyData = [];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOrders = adminOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const orderDateStr = orderDate.toISOString().split('T')[0];
        return orderDateStr === dateStr;
      });

      const onlineRevenue = dayOrders.filter(order => order.status === 'paid').length;
      const offlineRevenue = Math.floor(onlineRevenue * 0.1);

      weeklyData.push({
        day: dayLabels[date.getDay() === 0 ? 6 : date.getDay() - 1],
        online: onlineRevenue,
        offline: offlineRevenue
      });
    }

    return weeklyData;
  };

  const revenueData = getWeeklyRevenue();
  const maxRevenue = Math.max(...revenueData.map(d => d.online + d.offline)) || 8000;

  const getSalesData = () => {
    const pendingOrders = adminOrders.filter(order => order.status === 'pending').length;
    const totalOrders = adminOrders.length || 1;

    const cancelledOrders = adminOrders.filter(order => order.status === 'cancelled').length;
    const paidOrders = adminOrders.filter(order => order.status === 'paid').length;

    return [
      { label: 'Cancelled', value: Math.round((cancelledOrders / totalOrders) * 100), color: '#f00a0aff' },
      { label: 'Paid', value: Math.round((paidOrders / totalOrders) * 100), color: '#3b82f6' },
      { label: 'Pending', value: Math.round((pendingOrders / totalOrders) * 100), color: '#17f40cff' }
    ];
  };

  const salesData = getSalesData();

  const getPieSegments = () => {
    let cumulativePercentage = 0;
    return salesData.map(item => {
      const startAngle = cumulativePercentage * 3.6;
      const endAngle = (cumulativePercentage + item.value) * 3.6;
      cumulativePercentage += item.value;

      return {
        ...item,
        startAngle,
        endAngle,
        circumference: 251.33,
        dashArray: (item.value / 100) * 251.33,
        dashOffset: -(startAngle / 360) * 251.33
      };
    });
  };

  const pieSegments = getPieSegments();

  return (
    <AdminLayout>
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-700 hover:text-orange-500 focus:outline-none"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-90 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            New Customer: {notification.firstName} {notification.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">DASHBOARD</h1>

        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
        
          {/* Total Income Card */}
          <div className="bg-orange-500 text-white p-4 sm:p-6 rounded-lg">
            <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">TODAY</div>
            <div className="text-xs mb-2 sm:mb-4">{currentDay}</div>
            <div className="text-base sm:text-xl font-bold">Total Income: ₱{todaysIncome.toLocaleString()}</div>
          </div>

          {/* Orders Card */}
          <div className="bg-orange-500 text-white p-4 sm:p-6 rounded-lg">
            <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">TODAY</div>
            <div className="text-xs mb-2 sm:mb-4">{currentDay}</div>
            <div className="text-base sm:text-xl font-bold">Orders: {todaysOrderCount}</div>
          </div>

          {/* New Customers Card */}
          <div className="bg-orange-500 text-white p-4 sm:p-6 rounded-lg">
            <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">TODAY</div>
            <div className="text-xs mb-2 sm:mb-4">{currentDay}</div>
            <div className="text-base sm:text-xl font-bold">New Customers: {todaysCustomers}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Total Revenue</h3>
            <div className="flex items-end justify-between h-48 sm:h-64 mb-4 overflow-x-auto">
              <div className="flex items-end justify-between w-full min-w-[500px]">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 px-1">
                    <div className="flex items-end justify-center w-full h-40 sm:h-48 mb-2">
                      <div className="relative group">
                        <div 
                          className="bg-blue-400 w-4 sm:w-6 mr-1 rounded-t"
                          style={{ height: `${Math.max((data.online / maxRevenue) * 50, 2)}px` }}
                        ></div>
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded">
                          {data.online} Paid
                        </div>
                      </div>
                      <div 
                        className="bg-green-400 w-4 sm:w-6 rounded-t"
                        style={{ height: `${Math.max((data.offline / maxRevenue) * 180, 2)}px` }}
                      ></div>
                    </div>
                    <span className="text-white text-xs">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 mr-2"></div>
                <span className="text-white">Online Sales</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 mr-2"></div>
                <span className="text-white">Offline Sales</span>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Overall Sales</h3>
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
              <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-4 md:mb-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {pieSegments.map((segment, index) => (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="20"
                      strokeDasharray={`${segment.dashArray} ${segment.circumference}`}
                      strokeDashoffset={segment.dashOffset}
                    />
                  ))}
                </svg>
              </div>
              <div className="w-full md:w-auto mt-4 md:mt-0 space-y-2">
                {salesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-white text-sm">{item.label}</span>
                    </div>
                    <span className="text-white text-sm">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;