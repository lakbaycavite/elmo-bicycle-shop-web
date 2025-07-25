import { useNavigate, useLocation } from 'react-router-dom'
import { doSignOut } from '../firebase/auth'

function Sidebar({ userType = "admin" }) {
  const navigate = useNavigate()
  const location = useLocation();

  const isAdmin = userType === "admin"

  // Define menu items with their routes
  const menuItems = [
    { label: 'INVENTORY', route: '/admin/inventory' },
    { label: 'USER ACTIVITY', route: '/admin/user-activity' },
    { label: 'ORDERS OVERVIEW', route: '/admin/orders-overview' },
    { label: 'USER MANAGEMENT', route: '/admin/user-management' },
    { label: 'ACCOUNT MANAGE', route: '/admin/account-manage' },
  ];

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
        {/* Removed Admin Panel label */}
      </div>
      <nav className="space-y-2">
        {isAdmin && (
          <>
            {menuItems.map((item) => {
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