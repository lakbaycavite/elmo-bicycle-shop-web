import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User } from 'lucide-react'; // Removed Bell here
import NavLinks from './NavLinks';
import SearchBar from './SearchBar';
import AuthButtons from './AuthButtons';
import Drawer from './Drawer';
import { doSignOut } from '../firebase/auth';
import { useCart } from '../hooks/useCart';

// Import Notification Components
import NotificationBadge from './NotificationBadge';
import NotificationModal from './NotificationModal';
import { toast } from 'sonner';
import { useAuth } from '../context/authContext/createAuthContext';

function Navbar({ isLoggedIn = false }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false); // New state for modal
  const { userLoggedIn } = useAuth();
  const { itemCount } = useCart();

  // Close drawer when screen size becomes large
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

  // Handlers for auth buttons
  const handleLogin = () => { setDrawerOpen(false); navigate('/login'); };
  const handleSignup = () => { setDrawerOpen(false); navigate('/signup'); };

  // Handlers for logged-in user actions
  const handleCart = () => { setDrawerOpen(false); navigate('/customer/cart'); };
  const handleWishlist = () => { setDrawerOpen(false); navigate('/customer/wishlist'); };
  const handleProfile = () => { setDrawerOpen(false); navigate('/customer/profile'); };

  // Toggle notification modal instead of navigating
  const handleNotificationsToggle = () => {
    setDrawerOpen(false); // Close drawer if open
    setNotificationsModalOpen(prev => !prev); // Toggle modal visibility
  };

  const handleLogout = async () => {
    setDrawerOpen(false);
    setNotificationsModalOpen(false); // Close modal on logout
    await doSignOut()
      .then(() => {
        toast.success("Logout successful");
      })
      .catch((error) => {
        console.error("Logout failed", error);
      });
    navigate('/');
  };

  return (
    <>
     <nav className="bg-black px-6 py-2">
  <div className="flex justify-between items-center">
    {/* Logo */}
    <div
      className="flex items-center cursor-pointer"
      onClick={() => navigate(isLoggedIn ? '/customer/home' : '/')}
    >
      <img
        src="/images/logos/elmo.png"
        alt="Elmo Bicycle Shop"
        className="h-10 w-auto"
      />
    </div>

    {/* Search Bar - Always show on mobile and desktop if logged in */}
    {isLoggedIn && (
      <div className="flex-1 flex justify-center px-6">
        <SearchBar />
      </div>
    )}

    {/* Right-side icons and buttons */}
    <div className="flex items-center gap-4">
      {/* Desktop nav links - visible only on large screens */}
      <div className={`${isLoggedIn ? 'hidden lg:flex' : 'hidden md:flex'} items-center gap-6`}>
        <NavLinks isLoggedIn={isLoggedIn} />
      </div>

      {isLoggedIn ? (
        <>
          {/* Icons - always visible */}
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
          {/* Logout - desktop only */}
          <button
            onClick={handleLogout}
            className="hidden lg:inline px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          {/* Show login/signup in desktop & mobile if not logged in */}
          <div className="hidden md:flex gap-2">
            <AuthButtons onLogin={handleLogin} onSignup={handleSignup} />
          </div>
        </>
      )}

      {/* Hamburger Menu Icon (only mobile) */}
      <div className={`${isLoggedIn ? 'flex lg:hidden' : 'flex md:hidden'} items-center`}>
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


      {/* Drawer Component */}
    {/* Custom Drawer for mobile nav links only */}
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
  isLoggedIn={isLoggedIn}
  className="flex flex-col gap-4 text-white text-lg"
  onNavigate={() => setDrawerOpen(false)}
/>

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="text-red-500 mt-4"
        >
          Logout
        </button>
      )}
      {!isLoggedIn && (
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