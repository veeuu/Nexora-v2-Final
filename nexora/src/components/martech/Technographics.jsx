import { useState, useEffect } from 'react';
import React from 'react';
import { useIndustry } from '../../context/IndustryContext';

const Technographics = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setIndustryData, setTechnologyData, setAvailableRegions } = useIndustry();
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [filters, setFilters] = useState({
    companyName: '',
    region: '',
    technology: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [ntpData, setNtpData] = useState([]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;

    const headers = Object.keys(filteredData[0]);
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row =>
        headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'technographics_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/technographics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);

        // Fetch NTP data
        const ntpResponse = await fetch('/api/ntp');
        if (ntpResponse.ok) {
          const ntpDataFetched = await ntpResponse.json();
          setNtpData(ntpDataFetched);
        }

        // Calculate industry counts from the table data
        const industryCounts = {};
        data.forEach(row => {
          const industry = row.industry || 'Other';
          industryCounts[industry] = (industryCounts[industry] || 0) + 1;
        });

        // Convert to array format for pie chart
        const industryArray = Object.entries(industryCounts).map(([label, value]) => ({
          label,
          value
        }));

        // Update the shared context with real industry data
        setIndustryData(industryArray);

        // Calculate technology adoption by region and category
        const techByRegion = {};
        const regions = new Set();

        data.forEach(row => {
          const region = row.region || 'Unknown';
          const category = row.category || 'Other';

          regions.add(region);

          if (!techByRegion[region]) {
            techByRegion[region] = {};
          }

          if (!techByRegion[region][category]) {
            techByRegion[region][category] = 0;
          }

          techByRegion[region][category]++;
        });

        // Calculate percentages for each region
        const techDataWithPercentages = {};
        Object.keys(techByRegion).forEach(region => {
          const total = Object.values(techByRegion[region]).reduce((sum, count) => sum + count, 0);
          techDataWithPercentages[region] = {};

          Object.keys(techByRegion[region]).forEach(category => {
            const percentage = total > 0 ? Math.round((techByRegion[region][category] / total) * 100) : 0;
            techDataWithPercentages[region][category] = percentage;
          });
        });

        setTechnologyData(techDataWithPercentages);
        setAvailableRegions(Array.from(regions).sort());
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Technographics data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setIndustryData, setTechnologyData, setAvailableRegions]);

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].sort();
  };

  const getNtpDataForCompany = (companyName) => {
    let data = ntpData.filter(row => row.companyName === companyName);
    
    // Filter by selected category if one is chosen
    if (filters.category) {
      data = data.filter(row => row.category === filters.category);
    }
    
    return data;
  };

  // Helper function to check if a row matches search term
  const rowMatchesSearch = (row) => {
    if (!searchTerm) return false;
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Helper function to highlight matching text
  const highlightText = (text, search) => {
    if (!search || !text) return text;
    const textStr = String(text);
    const searchLower = search.toLowerCase();
    const textLower = textStr.toLowerCase();
    const index = textLower.indexOf(searchLower);

    if (index === -1) return textStr;

    const before = textStr.substring(0, index);
    const match = textStr.substring(index, index + search.length);
    const after = textStr.substring(index + search.length);

    return (
      <>
        {before}
        <span style={{ backgroundColor: '#fef08a', fontWeight: '600', padding: '2px 4px', borderRadius: '2px' }}>
          {match}
        </span>
        {after}
      </>
    );
  };

  const filteredData = tableData
    .filter(row => {
      const filterMatches = Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        return String(row[key]) === filters[key];
      });

      const searchMatches = !searchTerm || Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filterMatches && searchMatches;
    })
    .sort((a, b) => {
      // Sort: matching rows first, then others
      const aMatches = rowMatchesSearch(a);
      const bMatches = rowMatchesSearch(b);

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  if (loading) {
    return <div>Loading Technographics data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="technographics-container">
      <div className="header-actions">
        <h2>Technographics</h2>
        <div className="actions-right">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="download-csv-button" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
      </div>

      <div className="section-subtle-divider" />
      <div className="filters">
        <div className="filter-group">
          <label>Company Name</label>
          <select
            value={filters.companyName}
            onChange={(e) => handleFilterChange('companyName', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('companyName').map((name, idx) => (
              <option key={`company-${idx}`} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Region</label>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('region').map((region, idx) => (
              <option key={`region-${idx}`} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('category').map((cat, idx) => (
              <option key={`category-${idx}`} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Technology</label>
          <select value={filters.technology} onChange={(e) => handleFilterChange('technology', e.target.value)}>
            <option value="">All</option>
            {getUniqueOptions('technology').map((tech, idx) => (
              <option key={`technology-${idx}`} value={tech}>{tech}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Company Name</th>
              <th>Domain</th>
              <th>Industry</th>
              <th>Region</th>
              {/* <th>Category</th> */}
              <th>Technology</th>
              {/* <th>Previous Detected Date</th> */}
              {/* <th>Latest Detected Date</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => {
              const isHighlighted = rowMatchesSearch(row);

              const handleMouseEnter = (e, text) => {
                const rect = e.target.getBoundingClientRect();
                setTooltip({
                  show: true,
                  text: text,
                  x: rect.right - 20,
                  y: rect.bottom + 20
                });
              };

              const handleMouseLeave = () => {
                setTooltip({ show: false, text: '', x: 0, y: 0 });
              };

              const handleCompanyNameMouseEnter = (e, companyName) => {
                const rect = e.target.getBoundingClientRect();
                setTooltip({
                  show: true,
                  text: companyName,
                  hint: 'Click to view NTP Analysis',
                  x: rect.right - 20,
                  y: rect.bottom + 20,
                  isCompanyName: true
                });
              };

              return (
                <tr 
                  key={index} 
                  style={{ backgroundColor: isHighlighted ? '#fefce8' : 'transparent', cursor: 'pointer' }}
                  onClick={() => setSelectedCompany(row.companyName)}
                >
                  <td onMouseEnter={(e) => handleCompanyNameMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.companyName, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.domain)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.domain, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.industry)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.industry, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.region)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.region, searchTerm)}
                  </td>
                  {/* <td onMouseEnter={(e) => handleMouseEnter(e, row.category)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.category, searchTerm)}
                  </td> */}
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.technology)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.technology, searchTerm)}
                  </td>
                  {/* <td onMouseEnter={(e) => handleMouseEnter(e, row.previousDetectedDate)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.previousDetectedDate, searchTerm)}
                  </td> */}
                  {/* <td onMouseEnter={(e) => handleMouseEnter(e, row.latestDetectedDate)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.latestDetectedDate, searchTerm)}
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Custom Tooltip */}
      {tooltip.show && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#ffffffff',
            color: 'black',
            padding: tooltip.isCompanyName ? '10px 12px' : '8px 12px',
            borderRadius: '6px',
            fontSize: tooltip.isCompanyName ? '13px' : '13px',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
            pointerEvents: 'none',
            maxWidth: '300px',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.4'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: tooltip.hint ? '6px' : '0' }}>
            {tooltip.text}
          </div>
          {tooltip.hint && (
            <div style={{ fontSize: '11px', color: 'rgb(0, 102, 204)', fontWeight: '400', fontStyle: 'italic' }}>
              💡 {tooltip.hint}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              right: '20px',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '5px solid white'
            }}
          />
        </div>
      )}

      {/* Side Panel for NTP Details */}
      {selectedCompany && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999
            }}
            onClick={() => setSelectedCompany(null)}
          />
          <div 
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '500px',
              backgroundColor: 'white',
              boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              overflowY: 'auto',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#010810' }}>{selectedCompany}</h3>
                <button
                  onClick={() => setSelectedCompany(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              {getNtpDataForCompany(selectedCompany).length > 0 ? (
                <div>
                  <h4 style={{ marginTop: 0, color: '#010810', marginBottom: '15px' }}>Technologies & Purchase Probability</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {getNtpDataForCompany(selectedCompany).map((item, idx) => (
                      <div 
                        key={idx}
                        style={{
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#010810' }}>{item.technology}</p>
                            <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{item.category}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#0066cc' }}>{item.purchaseProbability}%</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666' }}>Probability</p>
                          </div>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                          <strong>Prediction:</strong> {item.purchasePrediction}
                        </p>
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '600', color: '#010810' }}>NTP Analysis:</p>
                          <p style={{ margin: '0', fontSize: '12px', color: '#555', lineHeight: '1.5' }}>
                            {item.ntpAnalysis || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>No NTP data available</p>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .table-container {
          max-height: 400px;
          overflow-x: auto;
          overflow-y: auto;
          position: relative;
        }
        
        .sticky-header {
          position: sticky;
          top: 0;
          background-color: #fff;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .sticky-header th {
          position: sticky;
          top: 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: default;
        }
        
        td {
          position: relative;
        }
        
        td:hover {
          background-color: #f9fafb;
        }
        
        /* Set specific column widths */
        th:nth-child(1), td:nth-child(1) { width: 150px; } /* Company Name */
        th:nth-child(2), td:nth-child(2) { width: 180px; } /* Domain */
        th:nth-child(3), td:nth-child(3) { width: 150px; } /* Industry */
        th:nth-child(4), td:nth-child(4) { width: 120px; } /* Region */
        th:nth-child(5), td:nth-child(5) { width: 150px; } /* Technology */
        {/* th:nth-child(6), td:nth-child(6) { width: 150px; } Category - COMMENTED OUT */}
        {/* th:nth-child(7), td:nth-child(7) { width: 140px; } Previous Detected Date - COMMENTED OUT */}
        {/* th:nth-child(8), td:nth-child(8) { width: 140px; } Latest Detected Date - COMMENTED OUT */}
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default Technographics;