import React from 'react';

const Menu = ({ activeSection, onMenuClick, menuItems }) => {
  return (
    <nav className="menu">
      <div className="menu-header">
        <div className="hamburger-menu">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span>Menu</span>
      </div>
      <ul className="menu-items">
        {menuItems.map((item) => (
          <li 
            key={item} 
            className={activeSection === item ? 'active' : ''}
            onClick={() => onMenuClick(item)}
          >
            {item}
          </li>
        ))}
      </ul>
      {/* <button className="sign-out-btn">Sign Out</button> */}
    </nav>
  );
};

export default Menu;