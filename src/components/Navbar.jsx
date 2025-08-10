import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User } from 'lucide-react';
import NavLinks from './NavLinks';
import SearchBar from './SearchBar';
import AuthButtons from './AuthButtons';
import Drawer from './Drawer';
import { doSignOut } from '../firebase/auth';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/authContext/createAuthContext';

// Notification Components
import NotificationBadge from './NotificationBadge';
import NotificationModal from './NotificationModal';
import { toast } from 'sonner';

function Navbar({ isLoggedIn = false }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const { userLoggedIn } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleResize = () => {
      const breakpoint = isLoggedIn ? 1024 : 768;
      if (window.innerWidth >= breakpoint) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoggedIn]);

  // Navigation handlers
  const handleLogin = () => { setDrawerOpen(false); navigate('/login'); };
  const handleSignup = () => { setDrawerOpen(false); navigate('/signup'); };
  const handleCart = () => { setDrawerOpen(false); navigate('/customer/cart'); };
  const handleWishlist = () => { setDrawerOpen(false); navigate('/customer/wishlist'); };
  const handleProfile = () => { setDrawerOpen(false); navigate('/customer/profile'); };

  const handleNotificationsToggle = () => {
    setDrawerOpen(false);
    setNotificationsModalOpen(prev => !prev);
  };

  const handleLogout = async () => {
    setDrawerOpen(false);
    setNotificationsModalOpen(false);
    await doSignOut()
      .then(() => toast.success("Logout successful"))
      .catch((error) => console.error("Logout failed", error));
    navigate('/');
  };

  return (
    <>
      <nav className="bg-black px-6 py-2 fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate(userLoggedIn ? '/customer/home' : '/')}
          >
            <img
              src="/images/logos/elmo.png"
              alt="Elmo Bicycle Shop"
              className="h-10 w-auto"
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex justify-center px-6">
            <SearchBar />
          </div>

          {/* Right-side icons and buttons */}
          <div className="flex items-center gap-4">
            {/* Desktop nav links */}
            <div className={`${userLoggedIn ? 'hidden lg:flex' : 'hidden md:flex'} items-center gap-6`}>
              <NavLinks isLoggedIn={userLoggedIn} />
            </div>

            {userLoggedIn ? (
              <>
                <button onClick={handleCart} className="text-white hover:text-orange-500 relative">
                  <ShoppingCart size={24} />
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                </button>
                <button onClick={handleWishlist} className="text-white hover:text-orange-500">
                  <Heart size={24} />
                </button>
                <button onClick={handleProfile} className="text-white hover:text-orange-500">
                  <User size={24} />
                </button>
                <button
                  onClick={handleNotificationsToggle}
                  className="text-white hover:text-orange-500 relative"
                >
                  <NotificationBadge />
                </button>
                <button
                  onClick={handleLogout}
                  className="hidden lg:inline px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="hidden md:flex gap-2">
                <AuthButtons onLogin={handleLogin} onSignup={handleSignup} />
              </div>
            )}

            {/* Hamburger Menu */}
            <div className={`${userLoggedIn ? 'flex lg:hidden' : 'flex md:hidden'} items-center`}>
              <button
                className="text-white focus:outline-none"
                onClick={() => setDrawerOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Drawer Menu */}
      {drawerOpen && (
        <div className="lg:hidden fixed top-0 right-0 h-full w-64 bg-black shadow-lg z-50 flex flex-col p-6 space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setDrawerOpen(false)}
              className="text-white text-3xl font-bold"
            >
              &times;
            </button>
          </div>
          <NavLinks
            isLoggedIn={userLoggedIn}
            className="flex flex-col gap-4 text-white text-lg"
            onNavigate={() => setDrawerOpen(false)}
          />

          {userLoggedIn && (
            <button onClick={handleLogout} className="text-red-500 mt-4">
              Logout
            </button>
          )}
          {!userLoggedIn && (
            <div className="flex flex-col gap-2 mt-4">
              <button onClick={handleLogin} className="bg-white text-black py-2 rounded">Login</button>
              <button onClick={handleSignup} className="bg-orange-500 text-white py-2 rounded">Signup</button>
            </div>
          )}
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
