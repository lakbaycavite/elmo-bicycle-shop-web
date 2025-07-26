import { useNavigate, useLocation } from 'react-router-dom'
import { doSignOut } from '../firebase/auth'
import { useUsers } from '../hooks/useUser';
import { useCallback, useEffect, useMemo } from 'react';

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation();
  const { currentUserData } = useUsers();

  // Define menu items with their routes
  const menuItems = useMemo(() => [
    { label: 'INVENTORY', route: '/admin/inventory' },
    { label: 'USER ACTIVITY', route: '/admin/user-activity' },
    { label: 'ORDERS OVERVIEW', route: '/admin/orders-overview' },
    { label: 'STAFF MANAGEMENT', route: '/admin/staff-management' },
    { label: 'ACCOUNT MANAGE', route: '/admin/account-manage' },

  ], []);

  // Filter menu items based on user role and pageAccess
  const getFilteredMenuItems = useCallback(() => {
    // If currentUserData is not yet loaded, return empty array to prevent showing wrong menus
    if (!currentUserData) {
      return [];
    }

    // If admin, show all menu items
    if (currentUserData.role === "admin") {
      return menuItems;
    }

    // If staff with specific pageAccess, only show relevant menu
    if (currentUserData.role === "staff" && currentUserData.pageAccess) {
      if (currentUserData.pageAccess === "inventory") {
        return menuItems.filter(item => item.label === 'INVENTORY');
      }
      if (currentUserData.pageAccess === "orders") {
        return menuItems.filter(item => item.label === 'ORDERS OVERVIEW');
      }
    }

    // Default: return empty array for security
    return [];
  }, [currentUserData, menuItems]);

  // Auto-redirect to appropriate page on role change or initial load
  useEffect(() => {
    if (currentUserData) {
      const filteredItems = getFilteredMenuItems();

      // If user has no access to current page, redirect to first allowed page
      if (filteredItems.length > 0 && !filteredItems.some(item => item.route === location.pathname)) {
        navigate(filteredItems[0].route);
      }
    }
  }, [currentUserData, location.pathname, navigate, getFilteredMenuItems]);

  const handleLogout = async () => {
    try {
      await doSignOut();
      console.log("Logout successful");
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
          <div>{currentUserData?.email}</div>
          <div className="text-orange-400 font-semibold">{currentUserData?.role || 'Loading...'}</div>
        </div>
      </div>
      <nav className="space-y-2">
        {currentUserData && (
          <>
            {getFilteredMenuItems().map((item) => {
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
          </>
        )}
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