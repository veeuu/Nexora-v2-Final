import { useState, useEffect } from 'react';
import logo from '../assets/Proplus Data Logo - Horizontal Transparent (1).png';

const Header = ({ onRegionChange }) => {
  const [selectedRegion, setSelectedRegion] = useState('United States');
  const [availableRegions, setAvailableRegions] = useState([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('/api/technographics');
        if (response.ok) {
          const data = await response.json();
          console.log('Technographics Data received:', data);
          const regions = [...new Set(data.map(item => item.region).filter(r => r && r !== 'N/A'))].sort();
          console.log('Extracted regions:', regions);
          setAvailableRegions(regions);
          
          // Get saved region from localStorage or default to United States
          const savedRegion = localStorage.getItem('selectedRegion');
          const regionToUse = (savedRegion && regions.includes(savedRegion)) ? savedRegion : 'United States';
          
          setSelectedRegion(regionToUse);
          if (onRegionChange) {
            onRegionChange(regionToUse);
          }
        } else {
          console.error('Failed to fetch technographics data:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch regions:', error);
      }
    };

    fetchRegions();
  }, [onRegionChange]);

  const handleRegionChange = (e) => {
    const value = e.target.value;
    setSelectedRegion(value);
    localStorage.setItem('selectedRegion', value);
    if (onRegionChange) {
      onRegionChange(value);
    }
  };

  const extractCountryCode = (region) => {
    if (!region) return '';
    const match = region.trim().match(/^[A-Z]{2}/i);
    return match ? match[0].toUpperCase() : '';
  };

  const getFlagEmoji = (code) => {
    if (!code || code.length !== 2) return '';
    return String.fromCodePoint(
      ...[...code].map(c => 127397 + c.charCodeAt())
    );
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
        <div className="region-selector">
          <select 
            className="region-dropdown" 
            value={selectedRegion} 
            onChange={handleRegionChange}
          >
            {availableRegions.map(region => {
              const countryCode = extractCountryCode(region);
              const flag = getFlagEmoji(countryCode);
              return (
                <option key={region} value={region}>
                  {flag ? `${flag} ${region}` : region}
                </option>
              );
            })}
          </select>
          {selectedRegion && (() => {
            const code = extractCountryCode(selectedRegion);
            const flag = getFlagEmoji(code);
            return flag ? (
              <span className="region-flag" title={selectedRegion}>
                {flag}
              </span>
            ) : null;
          })()}
        </div>
      </div>

      <style jsx>{`
        .region-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .region-dropdown {
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background-color: white;
          cursor: pointer;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          min-width: 220px;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg fill='%23333' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 20px;
          padding-right: 36px;
        }

        .region-dropdown:hover {
          border-color: #999;
          background-color: #f9f9f9;
        }

        .region-dropdown:focus {
          outline: none;
          border-color: #0066cc;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .region-dropdown option {
          padding: 8px;
          font-size: 14px;
        }

        .region-flag {
          font-size: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background-color: #f0f0f0;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .region-flag:hover {
          background-color: #e0e0e0;
        }
      `}</style>
    </header>
  );
};

export default Header;
