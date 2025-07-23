import React from 'react';
import { useNavigate } from 'react-router-dom';

function NavLinks({ className = '', isLoggedIn = false }) {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    if (isLoggedIn) {
      // For logged-in users, navigate to customer routes
      switch (route) {
        case 'home':
          navigate('/customer/home');
          break;
        case 'shop':
          navigate('/customer/products');
          break;
        case 'about':
          navigate('/customer/about');
          break;
        case 'contact':
          navigate('/customer/contact');
          break;
        default:
          navigate('/customer/home');
      }
    } else {
      // For logged-out users, navigate to pre-auth routes
      switch (route) {
        case 'home':
          navigate('/');
          break;
        case 'shop':
          navigate('/products');
          break;
        case 'about':
          navigate('/about');
          break;
        case 'contact':
          navigate('/contact');
          break;
        default:
          navigate('/');
      }
    }
  };

  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
      <button 
        className="text-white hover:text-orange-500 font-normal" 
        onClick={() => handleNavigation('home')}
      >
        Home
      </button>
      <button 
        className="text-white hover:text-orange-500 font-normal" 
        onClick={() => handleNavigation('shop')}
      >
        Shop
      </button>
      <button 
        className="text-white hover:text-orange-500 font-normal" 
        onClick={() => handleNavigation('about')}
      >
        About
      </button>
      <button 
        className="text-white hover:text-orange-500 font-normal" 
        onClick={() => handleNavigation('contact')}
      >
        Contact
      </button>
    </div>
  );
}

export default NavLinks; 