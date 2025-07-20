import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';
import NavLinks from './NavLinks';
import SearchBar from './SearchBar';
import AuthButtons from './AuthButtons';
import Drawer from './Drawer';

function Navbar({ isLoggedIn = false, userType = "customer" }) {
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

  if (isLoggedIn) {
    // Post-auth navbar (for customers)
    return (
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/customer/home')}>
            <img 
              src="/images/logos/elmo.png" 
              alt="Elmo Bicycle Shop" 
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/customer/home')}
              className="text-gray-600 hover:text-orange-600"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/customer/products')}
              className="text-gray-600 hover:text-orange-600"
            >
              Products
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    )
  }

  // Pre-auth navbar (for homepage)
  return (
    <>
      <nav className="bg-black px-6 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}> 
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

          {/* Navigation Links & Auth Buttons (hidden on small screens) */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
            <AuthButtons onLogin={handleLogin} onSignup={handleSignup} />
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
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onLogin={handleLogin} onSignup={handleSignup} />
    </>
  )
}

export default Navbar 