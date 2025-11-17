import { useState, useEffect } from 'react';

const Menu = ({ activeSection, onMenuClick, menuItems, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true); // Always open on desktop
      } else {
        setIsOpen(false); // Closed by default on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    }
  };

  const handleMenuItemClick = (item) => {
    onMenuClick(item);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <nav className={`menu ${isOpen ? 'open' : ''}`}>
      <div className="menu-header" onClick={toggleMenu}>
        <div className="hamburger-menu">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span style={{ flex: 1 }}>Menu</span>
      </div>
      <ul className="menu-items">
        {menuItems.map((item) => (
          <li 
            key={item} 
            className={activeSection === item ? 'active' : ''}
            onClick={() => handleMenuItemClick(item)}
          >
            {item}
          </li>
        ))}
      </ul>
      <div className="menu-footer">
        <button className="sign-out-btn" onClick={() => onLogout && onLogout()}>
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Menu;