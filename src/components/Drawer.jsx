import React from 'react';
import NavLinks from './NavLinks';
import SearchBar from './SearchBar';
import AuthButtons from './AuthButtons';

function Drawer({ open, onClose, onLogin, onSignup }) {
  if (!open) return null;
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
          <NavLinks className="flex-col gap-4" onClick={onClose} />
          <AuthButtons onLogin={onLogin} onSignup={onSignup} className="mt-8" />
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