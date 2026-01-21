import { useState, useEffect, useRef } from 'react';
import logo from '../assets/Proplus Data Logo - Horizontal Transparent (1).png';
import Flag from 'country-flag-icons/react/3x2';

const Header = ({ onRegionChange }) => {
  const [selectedRegion, setSelectedRegion] = useState('United States');
  const [availableRegions, setAvailableRegions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const countryCodeMap = {
    // Full country names
    'Afghanistan': 'AF', 'Åland Islands': 'AX', 'Albania': 'AL', 'Algeria': 'DZ', 'American Samoa': 'AS',
    'Andorra': 'AD', 'Angola': 'AO', 'Anguilla': 'AI', 'Antarctica': 'AQ', 'Antigua and Barbuda': 'AG',
    'Argentina': 'AR', 'Armenia': 'AM', 'Aruba': 'AW', 'Australia': 'AU', 'Austria': 'AT',
    'Azerbaijan': 'AZ', 'Bahamas': 'BS', 'Bahrain': 'BH', 'Bangladesh': 'BD', 'Barbados': 'BB',
    'Belarus': 'BY', 'Belgium': 'BE', 'Belize': 'BZ', 'Benin': 'BJ', 'Bermuda': 'BM',
    'Bhutan': 'BT', 'Bolivia': 'BO', 'Bosnia and Herzegovina': 'BA', 'Botswana': 'BW', 'Bouvet Island': 'BV',
    'Brazil': 'BR', 'British Indian Ocean Territory': 'IO', 'Brunei': 'BN', 'Bulgaria': 'BG', 'Burkina Faso': 'BF',
    'Burundi': 'BI', 'Cambodia': 'KH', 'Cameroon': 'CM', 'Canada': 'CA', 'Cape Verde': 'CV',
    'Cayman Islands': 'KY', 'Central African Republic': 'CF', 'Chad': 'TD', 'Chile': 'CL', 'China': 'CN',
    'Christmas Island': 'CX', 'Cocos Islands': 'CC', 'Colombia': 'CO', 'Comoros': 'KM', 'Congo': 'CG',
    'Cook Islands': 'CK', 'Costa Rica': 'CR', 'Croatia': 'HR', 'Cuba': 'CU', 'Cyprus': 'CY',
    'Czech Republic': 'CZ', 'Czechia': 'CZ', 'Denmark': 'DK', 'Djibouti': 'DJ', 'Dominica': 'DM',
    'Dominican Republic': 'DO', 'Ecuador': 'EC', 'Egypt': 'EG', 'El Salvador': 'SV', 'Equatorial Guinea': 'GQ',
    'Eritrea': 'ER', 'Estonia': 'EE', 'Ethiopia': 'ET', 'Falkland Islands': 'FK', 'Faroe Islands': 'FO',
    'Fiji': 'FJ', 'Finland': 'FI', 'France': 'FR', 'French Guiana': 'GF', 'French Polynesia': 'PF',
    'French Southern Territories': 'TF', 'Gabon': 'GA', 'Gambia': 'GM', 'Georgia': 'GE', 'Germany': 'DE',
    'Ghana': 'GH', 'Gibraltar': 'GI', 'Greece': 'GR', 'Greenland': 'GL', 'Grenada': 'GD',
    'Guadeloupe': 'GP', 'Guam': 'GU', 'Guatemala': 'GT', 'Guernsey': 'GG', 'Guinea': 'GN',
    'Guinea-Bissau': 'GW', 'Guyana': 'GY', 'Haiti': 'HT', 'Heard Island': 'HM', 'Honduras': 'HN',
    'Hong Kong': 'HK', 'Hungary': 'HU', 'Iceland': 'IS', 'India': 'IN', 'Indonesia': 'ID',
    'Iran': 'IR', 'Iraq': 'IQ', 'Ireland': 'IE', 'Isle of Man': 'IM', 'Israel': 'IL',
    'Italy': 'IT', 'Ivory Coast': 'CI', 'Jamaica': 'JM', 'Japan': 'JP', 'Jersey': 'JE',
    'Jordan': 'JO', 'Kazakhstan': 'KZ', 'Kenya': 'KE', 'Kiribati': 'KI', 'Kosovo': 'XK',
    'Kuwait': 'KW', 'Kyrgyzstan': 'KG', 'Laos': 'LA', 'Latvia': 'LV', 'Lebanon': 'LB',
    'Lesotho': 'LS', 'Liberia': 'LR', 'Libya': 'LY', 'Liechtenstein': 'LI', 'Lithuania': 'LT',
    'Luxembourg': 'LU', 'Macao': 'MO', 'Macedonia': 'MK', 'Madagascar': 'MG', 'Malawi': 'MW',
    'Malaysia': 'MY', 'Maldives': 'MV', 'Mali': 'ML', 'Malta': 'MT', 'Marshall Islands': 'MH',
    'Martinique': 'MQ', 'Mauritania': 'MR', 'Mauritius': 'MU', 'Mayotte': 'YT', 'Mexico': 'MX',
    'Micronesia': 'FM', 'Moldova': 'MD', 'Monaco': 'MC', 'Mongolia': 'MN', 'Montenegro': 'ME',
    'Montserrat': 'MS', 'Morocco': 'MA', 'Mozambique': 'MZ', 'Myanmar': 'MM', 'Namibia': 'NA',
    'Nauru': 'NR', 'Nepal': 'NP', 'Netherlands': 'NL', 'New Caledonia': 'NC', 'New Zealand': 'NZ',
    'Nicaragua': 'NI', 'Niger': 'NE', 'Nigeria': 'NG', 'Niue': 'NU', 'Norfolk Island': 'NF',
    'North Korea': 'KP', 'Northern Mariana Islands': 'MP', 'Norway': 'NO', 'Oman': 'OM', 'Pakistan': 'PK',
    'Palau': 'PW', 'Palestine': 'PS', 'Panama': 'PA', 'Papua New Guinea': 'PG', 'Paraguay': 'PY',
    'Peru': 'PE', 'Philippines': 'PH', 'Pitcairn': 'PN', 'Poland': 'PL', 'Portugal': 'PT',
    'Puerto Rico': 'PR', 'Qatar': 'QA', 'Reunion': 'RE', 'Romania': 'RO', 'Russia': 'RU',
    'Rwanda': 'RW', 'Saint Barthélemy': 'BL', 'Saint Helena': 'SH', 'Saint Kitts and Nevis': 'KN',
    'Saint Lucia': 'LC', 'Saint Martin': 'MF', 'Saint Pierre and Miquelon': 'PM', 'Saint Vincent and the Grenadines': 'VC',
    'Samoa': 'WS', 'San Marino': 'SM', 'Sao Tome and Principe': 'ST', 'Saudi Arabia': 'SA', 'Senegal': 'SN',
    'Serbia': 'RS', 'Seychelles': 'SC', 'Sierra Leone': 'SL', 'Singapore': 'SG', 'Sint Maarten': 'SX',
    'Slovakia': 'SK', 'Slovenia': 'SI', 'Solomon Islands': 'SB', 'Somalia': 'SO', 'South Africa': 'ZA',
    'South Georgia': 'GS', 'South Korea': 'KR', 'South Sudan': 'SS', 'Spain': 'ES', 'Sri Lanka': 'LK',
    'Sudan': 'SD', 'Suriname': 'SR', 'Svalbard and Jan Mayen': 'SJ', 'Sweden': 'SE', 'Switzerland': 'CH',
    'Syria': 'SY', 'Taiwan': 'TW', 'Tajikistan': 'TJ', 'Tanzania': 'TZ', 'Thailand': 'TH',
    'Timor-Leste': 'TL', 'Togo': 'TG', 'Tokelau': 'TK', 'Tonga': 'TO', 'Trinidad and Tobago': 'TT',
    'Tunisia': 'TN', 'Turkey': 'TR', 'Turkmenistan': 'TM', 'Turks and Caicos Islands': 'TC', 'Tuvalu': 'TV',
    'Uganda': 'UG', 'Ukraine': 'UA', 'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'United States': 'US',
    'Uruguay': 'UY', 'Uzbekistan': 'UZ', 'Vanuatu': 'VU', 'Vatican City': 'VA', 'Venezuela': 'VE',
    'Vietnam': 'VN', 'Virgin Islands': 'VG', 'Wallis and Futuna': 'WF', 'Western Sahara': 'EH', 'Yemen': 'YE',
    'Zambia': 'ZM', 'Zimbabwe': 'ZW',
    // Abbreviations and variations from data
    'AU': 'AU', 'AUSTRALIA': 'AU',
    'IN': 'IN', 'INDIA': 'IN',
    'ID': 'ID', 'INDONESIA': 'ID',
    'JP': 'JP', 'JAPAN': 'JP',
    'KR': 'KR', 'KOREA': 'KR', 'SOUTH KOREA': 'KR',
    'MY': 'MY', 'MALAYSIA': 'MY',
    'NZ': 'NZ', 'NEW ZEALAND': 'NZ',
    'SG': 'SG', 'SINGAPORE': 'SG',
    'TH': 'TH', 'THAILAND': 'TH',
    'VN': 'VN', 'VIETNAM': 'VN',
    'PH': 'PH', 'PHILIPPINES': 'PH',
    'BD': 'BD', 'BANGLADESH': 'BD',
    'PK': 'PK', 'PAKISTAN': 'PK',
    'LK': 'LK', 'SRI LANKA': 'SRI LANKA',
    'US': 'US', 'USA': 'US', 'UNITED STATES': 'US',
    'GB': 'GB', 'UK': 'GB', 'UNITED KINGDOM': 'GB',
    'CA': 'CA', 'CANADA': 'CA',
    'MX': 'MX', 'MEXICO': 'MX',
    'BR': 'BR', 'BRAZIL': 'BR',
    'DE': 'DE', 'GERMANY': 'DE',
    'FR': 'FR', 'FRANCE': 'FR',
    'IT': 'IT', 'ITALY': 'IT',
    'ES': 'ES', 'SPAIN': 'ES',
    'NL': 'NL', 'NETHERLANDS': 'NL',
    'SE': 'SE', 'SWEDEN': 'SE',
    'NO': 'NO', 'NORWAY': 'NO',
    'CH': 'CH', 'SWITZERLAND': 'CH',
    'AT': 'AT', 'AUSTRIA': 'AT',
    'BE': 'BE', 'BELGIUM': 'BE',
    'DK': 'DK', 'DENMARK': 'DK',
    'FI': 'FI', 'FINLAND': 'FI',
    'PL': 'PL', 'POLAND': 'PL',
    'RU': 'RU', 'RUSSIA': 'RU',
    'CN': 'CN', 'CHINA': 'CN',
    'HK': 'HK', 'HONG KONG': 'HK',
    'TW': 'TW', 'TAIWAN': 'TW',
    'AE': 'AE', 'UAE': 'AE', 'UNITED ARAB EMIRATES': 'AE',
    'SA': 'SA', 'SAUDI ARABIA': 'SA',
    'ZA': 'ZA', 'SOUTH AFRICA': 'ZA'
  };

  const extractCountryCode = (region) => {
    if (!region) return '';
    const trimmed = region.trim();
    // First try exact match
    if (countryCodeMap[trimmed]) {
      return countryCodeMap[trimmed];
    }
    // Try uppercase match
    const upper = trimmed.toUpperCase();
    if (countryCodeMap[upper]) {
      return countryCodeMap[upper];
    }
    // If it's already a 2-letter code, return it
    if (trimmed.length === 2) {
      return trimmed.toUpperCase();
    }
    return '';
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setIsDropdownOpen(false);
    localStorage.setItem('selectedRegion', region);
    if (onRegionChange) {
      onRegionChange(region);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="region-selector" ref={dropdownRef}>
          <div 
            className="region-dropdown-custom"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="dropdown-selected">
              {(() => {
                const code = extractCountryCode(selectedRegion);
                const FlagComponent = code ? Flag[code] : null;
                return (
                  <>
                    {FlagComponent && (
                      <div className="dropdown-flag-small">
                        <FlagComponent style={{ width: '20px', height: '13px' }} />
                      </div>
                    )}
                    <span>{selectedRegion}</span>
                  </>
                );
              })()}
            </div>
            <svg className="dropdown-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {isDropdownOpen && (
            <div className="region-dropdown-menu">
              {availableRegions.map(region => {
                const countryCode = extractCountryCode(region);
                const FlagComponent = countryCode ? Flag[countryCode] : null;
                const isSelected = region === selectedRegion;
                return (
                  <div
                    key={region}
                    className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectRegion(region)}
                  >
                    {FlagComponent && (
                      <div className="dropdown-flag-small">
                        <FlagComponent style={{ width: '20px', height: '13px' }} />
                      </div>
                    )}
                    <span>{region}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .region-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .region-dropdown-custom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background-color: white;
          cursor: pointer;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          min-width: 220px;
          user-select: none;
          transition: all 0.2s;
        }

        .region-dropdown-custom:hover {
          border-color: #999;
          background-color: #f9f9f9;
        }

        .region-dropdown-custom:focus {
          outline: none;
          border-color: #0066cc;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .dropdown-selected {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .dropdown-flag-small {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 16px;
          border-radius: 2px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .dropdown-arrow {
          color: #666;
          margin-left: 8px;
          transition: transform 0.2s;
        }

        .region-dropdown-custom.open .dropdown-arrow {
          transform: rotate(180deg);
        }

        .region-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: white;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 6px 6px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .dropdown-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
        }

        .dropdown-option:hover {
          background-color: #f0f0f0;
        }

        .dropdown-option.selected {
          background-color: #e3f2fd;
          font-weight: 600;
          color: #0066cc;
        }
      `}</style>
    </header>
  );
};

export default Header;
