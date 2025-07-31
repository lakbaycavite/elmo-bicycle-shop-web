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
          navigate('/customer/home');
          setTimeout(() => {
            const contactSection = document.getElementById('contact-section');
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
          break;
        case 'spin-wheel':
          navigate('/customer/spin-wheel');
          break;
        default:
          navigate('/customer/home');
      }
    } else {
      // For logged-out users, navigate to pre-auth routes
      switch (route) {
        case 'home':
          navigate('/customer/home');
          break;
        case 'shop':
          navigate('/login');
          break;
        case 'about':
          navigate('/customer/about');
          break;
        case 'contact':
          navigate('/customer/home');
          setTimeout(() => {
            const contactSection = document.getElementById('contact-section');
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
          break;
        default:
          navigate('/customer/home');
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
      <button
        className="text-white hover:text-orange-500 font-normal"
        onClick={() => handleNavigation('spin-wheel')}
      >
        Spin
      </button>
    </div>
  );
}

export default NavLinks; 