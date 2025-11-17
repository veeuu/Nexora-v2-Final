import { useState } from 'react';
import logo from '../assets/Proplus Data Logo - Horizontal Transparent (1).png';

const Header = ({ onDropdownChange }) => {
  const [selectedOption, setSelectedOption] = useState('Market');

  const handleDropdownChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);
    onDropdownChange(value);
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="brand">
          <img src={logo} alt="Proplus Data" className="brand-logo" />
          <span className="brand-sep">|</span>
          <div className="brand-text">
            <h1 className="title">Nexora®</h1>
            <p className="tagline">Insights Beyond Numbers</p>
          </div>
        </div>
      </div>
      <div className="header-right">
        {/* <select 
          className="dropdown" 
          value={selectedOption} 
          onChange={handleDropdownChange}
        >
          <option value="Martech">Martech</option>
          <option value="Market">Market</option>
        </select> */}
      </div>
    </header>
  );
};

export default Header;