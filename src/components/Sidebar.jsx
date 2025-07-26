import { useNavigate, useLocation } from 'react-router-dom'
import { doSignOut } from '../firebase/auth'
import { useUsers } from '../hooks/useUser';
import { useEffect, useState, useLayoutEffect } from 'react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserData } = useUsers();

  // Define menu items with their routes
  const menuItems = [
    { label: 'INVENTORY', route: '/admin/inventory' },
    { label: 'USER ACTIVITY', route: '/admin/user-activity' },
    { label: 'ORDERS OVERVIEW', route: '/admin/orders-overview' },
    { label: 'STAFF MANAGEMENT', route: '/admin/staff-management' },
    { label: 'ACCOUNT MANAGE', route: '/admin/account-manage' },
  ];

  // Initialize state with localStorage values to prevent flickering
  const [visibleMenuItems, setVisibleMenuItems] = useState(() => {
    const saved = localStorage.getItem('elmo_menu_items');
    try {
      return saved ? JSON.parse(saved) : (
        // Default to all menu items - better to show all than none during loading
        menuItems
      );
    } catch (error) {
      console.error("Error parsing saved menu items:", error);
      return menuItems;
    }
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('elmo_user_role') || 'Loading...';
  });

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('elmo_user_email') || 'lanceballicud';
  });

  // Use useLayoutEffect to update menu before browser paint to prevent flickering
  useLayoutEffect(() => {
    if (currentUserData) {
      // Update role and email
      setUserRole(currentUserData.role);
      localStorage.setItem('elmo_user_role', currentUserData.role);

      if (currentUserData.email) {
        setUserEmail(currentUserData.email);
        localStorage.setItem('elmo_user_email', currentUserData.email);
      }

      // Calculate visible menu items
      let items = [];

      if (currentUserData.role === "admin") {
        items = menuItems;
      } else if (currentUserData.role === "staff" && currentUserData.pageAccess) {
        if (currentUserData.pageAccess === "inventory") {
          items = menuItems.filter(item => item.label === 'INVENTORY');
        } else if (currentUserData.pageAccess === "orders") {
          items = menuItems.filter(item => item.label === 'ORDERS OVERVIEW');
        }
      }

      // Only update if different to avoid unnecessary renders
      if (JSON.stringify(items) !== JSON.stringify(visibleMenuItems)) {
        setVisibleMenuItems(items);
        localStorage.setItem('elmo_menu_items', JSON.stringify(items));
      }
    }
  }, [currentUserData]);

  // Handle auto-redirect
  useEffect(() => {
    if (currentUserData && visibleMenuItems.length > 0) {
      if (!visibleMenuItems.some(item => item.route === location.pathname)) {
        navigate(visibleMenuItems[0].route);
      }
    }
  }, [currentUserData, visibleMenuItems, location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      // Clear localStorage on logout
      localStorage.removeItem('elmo_menu_items');
      localStorage.removeItem('elmo_user_role');
      localStorage.removeItem('elmo_user_email');

      await doSignOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <div className="mb-8">
        <img
          src="/images/logos/elmo.png"
          alt="Elmo Bicycle Shop"
          className="h-10 w-auto mb-2"
        />
        {/* User info and timestamp */}
        <div className="text-xs text-gray-400 mt-2">
          <div>{userEmail}</div>
          <div className="text-orange-400 font-semibold">{userRole}</div>
        </div>
      </div>
      <nav className="space-y-2">
        {/* Always show menu items - never conditional render the whole list */}
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <button
              key={item.route}
              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 uppercase font-bold ${isActive ? 'text-orange-400' : 'text-white'}`}
              onClick={() => navigate(item.route)}
              style={isActive ? { fontWeight: 'bold' } : {}}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-8 pt-8 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-red-300"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar