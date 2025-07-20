import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Bell } from 'lucide-react';
import NavLinks from './NavLinks';
import SearchBar from './SearchBar';
import AuthButtons from './AuthButtons';
import Drawer from './Drawer';

function Navbar({ isLoggedIn = false }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer when screen size becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers for auth buttons
  const handleLogin = () => { setDrawerOpen(false); navigate('/login'); };
  const handleSignup = () => { setDrawerOpen(false); navigate('/signup'); };

  // Handlers for logged-in user actions
  const handleCart = () => { setDrawerOpen(false); navigate('/customer/cart'); };
  const handleWishlist = () => { setDrawerOpen(false); navigate('/customer/wishlist'); };
  const handleProfile = () => { setDrawerOpen(false); navigate('/customer/profile'); };
  const handleNotifications = () => { setDrawerOpen(false); navigate('/customer/notifications'); };
  const handleLogout = () => { setDrawerOpen(false); navigate('/'); };

  return (
    <>
      <nav className="bg-black px-6 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate(isLoggedIn ? '/customer/home' : '/')}> 
            <img 
              src="/images/logos/elmo.png" 
              alt="Elmo Bicycle Shop" 
              className="h-10 w-auto"
            />
          </div>

          {/* Search Bar (hidden on small screens) */}
          <div className="flex-1 flex justify-center px-6 hidden md:flex">
            <SearchBar />
          </div>

          {/* Navigation Links & Right-side Buttons (hidden on small screens) */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks isLoggedIn={isLoggedIn} />
            
            {isLoggedIn ? (
              // Logged-in user icons
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCart}
                  className="text-white hover:text-orange-500 relative"
                >
                  <ShoppingCart size={24} />
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    1
                  </span>
                </button>
                <button
                  onClick={handleWishlist}
                  className="text-white hover:text-orange-500"
                >
                  <Heart size={24} />
                </button>
                <button
                  onClick={handleProfile}
                  className="text-white hover:text-orange-500"
                >
                  <User size={24} />
                </button>
                <button
                  onClick={handleNotifications}
                  className="text-white hover:text-orange-500"
                >
                  <Bell size={24} />
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Auth buttons for logged-out users
              <AuthButtons onLogin={handleLogin} onSignup={handleSignup} />
            )}
          </div>

          {/* Hamburger Menu Icon (only on small screens) */}
          <div className="flex md:hidden items-center">
            <button className="text-white focus:outline-none" onClick={() => setDrawerOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onLogin={handleLogin} onSignup={handleSignup} isLoggedIn={isLoggedIn} />
    </>
  )
}

export default Navbar 