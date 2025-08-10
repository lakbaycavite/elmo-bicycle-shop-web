import React from 'react';
import { useNavigate } from 'react-router-dom';

function NavLinks({ className = '', isLoggedIn = false, onNavigate }) {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    if (onNavigate) onNavigate(); // Close drawer first if needed

    switch (route) {
      case 'home':
        navigate('/customer/home');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        break;

      // Shop - always accessible
      case 'shop':
        navigate('/customer/products');
        break;

      // About - always accessible
    case 'about':
  navigate('/customer/home');
  setTimeout(() => {
    const section = document.getElementById('features-section');
    if (section) {
      const yOffset = -100; // Adjust this value based on your header height
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 300);
  break;

      case 'contact':
        navigate('/customer/home');
        setTimeout(() => {
          const section = document.getElementById('contact-section');
          section?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;

      case 'spin-wheel':
        if (isLoggedIn) {
          navigate('/customer/spin-wheel');
        } else {
          navigate('/login');
        }
        break;

      default:
        navigate('/customer/home');
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
