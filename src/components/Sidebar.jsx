import { useNavigate, useLocation } from 'react-router-dom'
import { doSignOut } from '../firebase/auth'
import { useUsers } from '../hooks/useUser';
import { useEffect, useState, useLayoutEffect } from 'react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserData } = useUsers();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Define menu items with their routes
  const menuItems = [
    { label: 'DASHBOARD', route: '/admin/dashboard' },
    { label: 'INVENTORY', route: '/admin/inventory' },
    { label: 'USER INFO', route: '/admin/user-activity' },
    { label: 'ORDERS OVERVIEW', route: '/admin/orders-overview' },
    { label: 'STAFF MANAGEMENT', route: '/admin/staff-management' },
    { label: 'ACCOUNT MANAGE', route: '/admin/account-manage' },
    { label: 'POS', route: '/admin/pos' },
  ];

  // Initialize state with localStorage values to prevent flickering
  const [visibleMenuItems, setVisibleMenuItems] = useState(() => {
    const saved = localStorage.getItem('elmo_menu_items');
    try {
      return saved ? JSON.parse(saved) : menuItems;
    } catch (error) {
      console.error("Error parsing saved menu items:", error);
      return menuItems;
    }
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('elmo_user_role') || 'Loading...';
  });

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('elmo_user_email') || currentUserData?.email || 'Loading...';
  });

  // Close drawer when screen size becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update menu items based on user role
  useLayoutEffect(() => {
    if (currentUserData) {
      setUserRole(currentUserData.role);
      localStorage.setItem('elmo_user_role', currentUserData.role);

      if (currentUserData.email) {
        setUserEmail(currentUserData.email);
        localStorage.setItem('elmo_user_email', currentUserData.email);
      }

      let items = [];
      if (currentUserData.role === "staff" && currentUserData.pageAccess) {
        if (currentUserData.pageAccess === "inventory") {
          items = menuItems.filter(item =>
            item.label === 'INVENTORY' || item.label === 'POS'
          );
        } else if (currentUserData.pageAccess === "orders") {
          items = menuItems.filter(item =>
            item.label === 'ORDERS OVERVIEW' || item.label === 'POS'
          );
        }
      } else if (currentUserData.role === "admin") {
        items = menuItems.filter(item => item.route.startsWith('/admin'));
      }

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
      localStorage.removeItem('elmo_menu_items');
      localStorage.removeItem('elmo_user_role');
      localStorage.removeItem('elmo_user_email');
      await doSignOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleMenuClick = (route) => {
    navigate(route);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button - Always visible with black color */}
      <div className="fixed top-4 left-4 z-40">
        <button
          className="text-black focus:outline-none"  // Changed to black
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar/Drawer - Only visible when drawerOpen is true */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30">
          
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setDrawerOpen(false)}
          />
          
          {/* Sidebar Content */}
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 text-white p-4 flex flex-col animate-slide-in-left">
            {/* Centered Logo */}
            <div className="flex justify-center mb-8">
              <img
                src="/images/logos/elmo.png"
                alt="Elmo Bicycle Shop"
                className="h-10 w-auto"
              />
            </div>

            {/* User info below centered logo */}
            <div className="text-xs text-gray-400 text-center mb-8">
              <div className="truncate px-4">{userEmail}</div>
              <div className="text-orange-400 font-semibold">{userRole}</div>
            </div>

            <nav className="space-y-2 flex-1 overflow-y-auto">
              {visibleMenuItems.map((item) => {
                const isActive = location.pathname === item.route;
                return (
                  <button
                    key={item.route}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 uppercase font-bold ${isActive ? 'text-orange-400' : 'text-white'}`}
                    onClick={() => handleMenuClick(item.route)}
                    style={isActive ? { fontWeight: 'bold' } : {}}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="pt-8 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.25s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </>
  )
}

export default Sidebar