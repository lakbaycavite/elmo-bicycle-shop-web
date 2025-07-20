import React from 'react';

function AuthButtons({ className = '', onLogin, onSignup }) {
  return (
    <div className={`flex flex-col md:flex-row gap-4 md:gap-6 ${className}`}>
      <button
        onClick={onLogin}
        className="text-white font-bold hover:text-orange-500 md:ml-4 text-center"
      >
        LOGIN
      </button>
      <button
        onClick={onSignup}
        className="px-6 py-3 bg-orange-600 text-white rounded font-bold hover:bg-orange-700 md:ml-4 text-center"
      >
        SIGN UP
      </button>
    </div>
  );
}

export default AuthButtons; 