import React from 'react';

function AuthButtons({ className = '', onLogin, onSignup }) {
  return (
    <div className={`flex flex-col md:flex-row gap-4 md:gap-6 ${className}`}>
      <button
        onClick={onLogin}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
      >
        Login
      </button>
      <button
        onClick={onSignup}
        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium"
      >
        Sign Up
      </button>
    </div>
  );
}

export default AuthButtons; 