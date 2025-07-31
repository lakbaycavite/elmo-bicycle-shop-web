import React from 'react';

function AuthButtons({ className = '', onLogin, onSignup }) {
  return (
    <div className={`flex flex-col md:flex-row gap-3 md:gap-4 ${className}`}>
      <button
        onClick={onLogin}
        className="px-6 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:text-black font-medium transition-colors duration-200 min-w-[100px]"
      >
        Login
      </button>
      <button
        onClick={onSignup}
        className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium transition-colors duration-200 min-w-[100px]"
      >
        Sign Up
      </button>
    </div>
  );
}

export default AuthButtons; 