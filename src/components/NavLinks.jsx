import React from 'react';

function NavLinks({ className = '', onClick }) {
  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
      <button className="text-white hover:text-orange-500 font-normal" onClick={onClick}>Home</button>
      <button className="text-white hover:text-orange-500 font-normal" onClick={onClick}>Shop</button>
      <button className="text-white hover:text-orange-500 font-normal" onClick={onClick}>About</button>
      <button className="text-white hover:text-orange-500 font-normal" onClick={onClick}>Contact</button>
    </div>
  );
}

export default NavLinks; 