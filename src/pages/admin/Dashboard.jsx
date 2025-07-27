import React from 'react';
import AdminLayout from './AdminLayout';
import { useOrder } from '../../hooks/useOrder';
import { useUsers } from '../../hooks/useUser';

function Dashboard() {
  const { adminOrders, getOrderStats } = useOrder();
  const { users } = useUsers();

  // Get today's date info
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const currentDay = dayNames[today.getDay()];

  // Calculate today's metrics
  const todaysOrders = adminOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const orderDateStr = orderDate.toISOString().split('T')[0];
    return orderDateStr === todayStr;
  });

  const todaysIncome = todaysOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const todaysOrderCount = todaysOrders.length;
  
  // Count customers registered today
  const todaysCustomers = users.filter(user => {
    if (user.role !== 'customer') return false;
    if (!user.createdAt) return false;
    const userDate = new Date(user.createdAt);
    const userDateStr = userDate.toISOString().split('T')[0];
    return userDateStr === todayStr;
  }).length;

  // Calculate weekly revenue data (last 7 days)
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

      // For now, we'll treat all orders as online since we don't have online/offline distinction
      // You can modify this based on paymentMethod or add an isOnline field to orders
      const onlineRevenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const offlineRevenue = Math.floor(onlineRevenue * 0.3); // Mock offline as 30% of online
      
      weeklyData.push({
        day: dayLabels[date.getDay() === 0 ? 6 : date.getDay() - 1], // Adjust for Monday start
        online: onlineRevenue,
        offline: offlineRevenue
      });
    }
    
    return weeklyData;
  };

  const revenueData = getWeeklyRevenue();
  const maxRevenue = Math.max(...revenueData.map(d => d.online + d.offline)) || 8000;

  // Calculate sales status distribution
  const getSalesData = () => {
    const completedOrders = adminOrders.filter(order => order.status === 'completed').length;
    const pendingOrders = adminOrders.filter(order => order.status === 'pending').length;
    const totalOrders = adminOrders.length || 1; // Avoid division by zero
    
    // Mock cancelled and on schedule for now (you can add these statuses to your order system)
    const cancelledOrders = Math.floor(totalOrders * 0.1); // 10% cancelled
    const onScheduleOrders = Math.floor(totalOrders * 0.15); // 15% on schedule
    
    return [
      { label: 'Sold', value: Math.round((completedOrders / totalOrders) * 100), color: '#ef4444' },
      { label: 'Cancelled', value: Math.round((cancelledOrders / totalOrders) * 100), color: '#f59e0b' },
      { label: 'On Schedule', value: Math.round((onScheduleOrders / totalOrders) * 100), color: '#3b82f6' },
      { label: 'Pending', value: Math.round((pendingOrders / totalOrders) * 100), color: '#a855f7' }
    ];
  };

  const salesData = getSalesData();

  // Calculate pie chart segments (simplified SVG approach)
  const getPieSegments = () => {
    let cumulativePercentage = 0;
    return salesData.map(item => {
      const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
      const endAngle = (cumulativePercentage + item.value) * 3.6;
      cumulativePercentage += item.value;
      
      return {
        ...item,
        startAngle,
        endAngle,
        // For SVG circle stroke-dasharray calculation
        circumference: 251.33, // 2 * π * 40 (radius)
        dashArray: (item.value / 100) * 251.33,
        dashOffset: -(startAngle / 360) * 251.33
      };
    });
  };

  const pieSegments = getPieSegments();

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">DASHBOARD</h1>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income Card */}
          <div className="bg-orange-500 text-white p-6 rounded-lg">
            <div className="text-sm font-medium mb-2">TODAY</div>
            <div className="text-xs mb-4">{currentDay}</div>
            <div className="text-xl font-bold">Total Income: ₱{todaysIncome.toLocaleString()}</div>
          </div>

          {/* Orders Card */}
          <div className="bg-orange-500 text-white p-6 rounded-lg">
            <div className="text-sm font-medium mb-2">TODAY</div>
            <div className="text-xs mb-4">{currentDay}</div>
            <div className="text-xl font-bold">Orders: {todaysOrderCount}</div>
          </div>

          {/* New Customers Card */}
          <div className="bg-orange-500 text-white p-6 rounded-lg">
            <div className="text-sm font-medium mb-2">TODAY</div>
            <div className="text-xs mb-4">{currentDay}</div>
            <div className="text-xl font-bold">New Customers: {todaysCustomers}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Total Revenue</h3>
            <div className="flex items-end justify-between h-64 mb-4">
              {revenueData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex items-end justify-center w-full h-48 mb-2">
                    {/* Online Sales Bar */}
                    <div 
                      className="bg-blue-400 w-6 mr-1 rounded-t"
                      style={{ height: `${Math.max((data.online / maxRevenue) * 180, 2)}px` }}
                    ></div>
                    {/* Offline Sales Bar */}
                    <div 
                      className="bg-green-400 w-6 rounded-t"
                      style={{ height: `${Math.max((data.offline / maxRevenue) * 180, 2)}px` }}
                    ></div>
                  </div>
                  <span className="text-white text-xs">{data.day}</span>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex space-x-4 text-sm">
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
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Overall Sales</h3>
            <div className="flex items-center justify-center">
              {/* Simple pie chart representation using CSS */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Create pie segments */}
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
            </div>
            {/* Legend */}
            <div className="mt-4 space-y-2">
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
    </AdminLayout>
  );
}

export default Dashboard; 