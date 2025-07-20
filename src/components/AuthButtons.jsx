import React from 'react';

function AuthButtons({ className = '', onLogin, onSignup }) {
  return (
    <div className={`flex flex-col md:flex-row gap-2 md:gap-2 ${className}`}>
      <button
        onClick={onLogin}
        className="text-white font-bold hover:text-orange-500 md:ml-4"
      >
        LOGIN
      </button>
      <button
        onClick={onSignup}
        className="px-4 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700 md:ml-2"
      >
        SIGN UP
      </button>
    </div>
  );
}

export default AuthButtons; 