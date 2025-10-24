import React, { useState, useEffect } from 'react';

const Growth = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDownloadCSV = () => {
    const headers = [
      'ID', 'Company Name', 'Domain', 'Industry', 'Country',
      'Period', 'End Date', 'Growth'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.id, row.companyName, row.domain, row.industry, row.country,
        row.period, row.endDate, row.growth
      ].map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'growth_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/growth');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Growth data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = tableData.filter(row => {
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return <div>Loading Growth data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="growth-section-container">
      <div className="header-controls">
        <h2>Growth (Predicted)</h2>
        <div className="action-items">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="download-csv-btn" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
      </div>
      
      <div className="section-subtle-divider" />
      
      <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <tr>
              <th colSpan="5">About</th>
              <th colSpan="3">Growth (Predicted)</th>
            </tr>
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Domain</th>
              <th>Industry</th>
              <th>Country</th>
              <th>Period</th>
              <th>End Date</th>
              <th>Growth</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                {/* About */}
                <td>{row.id}</td>
                <td>{row.companyName}</td>
                <td>{row.domain}</td>
                <td>{row.industry}</td>
                <td>{row.country}</td>
                
                {/* Growth (Predicted) */}
                <td>{row.period}</td>
                <td>{row.endDate}</td>
                <td>{row.growth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <style jsx>{`
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
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          white-space: nowrap;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
      `}</style>l
    </div>
  );
};

export default Growth;