import React from 'react';
import { ShoppingCart, Heart, User, Bell } from 'lucide-react';
import NavLinks from './NavLinks';
import SearchBar from './SearchBar';
import AuthButtons from './AuthButtons';

function Drawer({ open, onClose, onLogin, onSignup, isLoggedIn = false }) {
  if (!open) return null;

  // Handlers for logged-in user actions
  const handleCart = () => { onClose(); /* navigate to cart */ };
  const handleWishlist = () => { onClose(); /* navigate to wishlist */ };
  const handleProfile = () => { onClose(); /* navigate to profile */ };
  const handleNotifications = () => { onClose(); /* navigate to notifications */ };
  const handleLogout = () => { onClose(); /* navigate to logout */ };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      {/* Drawer panel */}
      <div className="ml-auto w-72 max-w-full h-full bg-neutral-900 shadow-lg p-6 flex flex-col gap-8 animate-slide-in-right relative">
        {/* Close button */}
        <button
          className="absolute top-6 right-6 text-white hover:text-orange-500 text-3xl font-bold focus:outline-none z-10"
          onClick={onClose}
          aria-label="Close drawer"
        >
          ×
        </button>
        
        {/* Content with top margin to avoid close button */}
        <div className="mt-12 flex flex-col gap-8">
          <SearchBar className="mb-4" />
          <NavLinks className="flex-col gap-4" isLoggedIn={isLoggedIn} />
          
          {isLoggedIn ? (
            // Logged-in user icons
            <div className="flex flex-col gap-4 mt-8">
              <button
                onClick={handleCart}
                className="flex items-center gap-3 text-white hover:text-orange-500"
              >
                <ShoppingCart size={24} />
                <span>Cart (1)</span>
              </button>
              <button
                onClick={handleWishlist}
                className="flex items-center gap-3 text-white hover:text-orange-500"
              >
                <Heart size={24} />
                <span>Wishlist</span>
              </button>
              <button
                onClick={handleProfile}
                className="flex items-center gap-3 text-white hover:text-orange-500"
              >
                <User size={24} />
                <span>Profile</span>
              </button>
              <button
                onClick={handleNotifications}
                className="flex items-center gap-3 text-white hover:text-orange-500"
              >
                <Bell size={24} />
                <span>Notifications</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mt-4"
              >
                Logout
              </button>
            </div>
          ) : (
            // Auth buttons for logged-out users
            <AuthButtons onLogin={onLogin} onSignup={onSignup} className="mt-8" />
          )}
        </div>
      </div>
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
}

export default Drawer; 