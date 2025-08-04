import React from 'react';
import { useNavigate } from 'react-router-dom';

function NavLinks({ className = '', isLoggedIn = false, onNavigate }) {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    if (onNavigate) onNavigate(); // Close drawer first if needed

    if (isLoggedIn) {
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
            const section = document.getElementById('contact-section');
            section?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          break;
        case 'spin-wheel':
          navigate('/customer/spin-wheel');
          break;
        default:
          navigate('/customer/home');
      }
    } else {
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
            const section = document.getElementById('contact-section');
            section?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          break;
        default:
          navigate('/customer/home');
      }
    }
  };

  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
      <button onClick={() => handleNavigation('home')}>Home</button>
      <button onClick={() => handleNavigation('shop')}>Shop</button>
      <button onClick={() => handleNavigation('about')}>About</button>
      <button onClick={() => handleNavigation('contact')}>Contact</button>
      <button onClick={() => handleNavigation('spin-wheel')}>Spin</button>
    </div>
  );
}


export default NavLinks; 