import React, { useState, useEffect } from 'react';

const Financial = () => {
  const [filters, setFilters] = useState({
    stockPerformance: '',
    buyerHolder: '',
    mutualFundHolders: '',
    growth: ''
  });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDownloadCSV = () => {
    const headers = [
      'ID', 'Company Name', 'Domain', 'Industry',
      'Full Time Employees', 'Investor Website', 'Exchange', 'Address', 'City',
      'State', 'Country', 'Contact', 'Date & Time', 'Current Price', 'Market Cap',
      'Total Revenue', 'Revenue Growth', 'Profit Growth'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.id,
        row.companyName,
        row.domain,
        row.industry,
        row.fullTimeEmployees,
        row.investorWebsite,
        row.exchange,
        row.address,
        row.city,
        row.state,
        row.country,
        row.contact,
        row.dateTime,
        row.currentPrice,
        row.marketCap,
        row.totalRevenue,
        row.revenueGrowth,
        row.profitGrowth
      ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'financial_data.csv');
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
        const response = await fetch('/api/financial/wide');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure every row has the performance objects to prevent runtime errors
        const sanitizedData = data.map(row => ({
          ...row,
          dailyPerformance: row.dailyPerformance || {},
          weeklyPerformance: row.weeklyPerformance || {},
          monthlyPerformance: row.monthlyPerformance || {},
          quarterlyPerformance: row.quarterlyPerformance || {},
        }));
        setTableData(sanitizedData);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Financial data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const filteredData = tableData.filter(row => {
    const matchesSearchTerm = Object.values(row).some(value => {
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (typeof value === 'object' && value !== null) {
        // Search within nested objects like dailyPerformance
        return Object.values(value).some(nestedValue =>
          String(nestedValue).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return false;
    });

    const matchesFilters =
      (filters.stockPerformance === '' || (filters.stockPerformance === 'High' && row.revenueGrowth && parseFloat(row.revenueGrowth) > 10) || (filters.stockPerformance === 'Medium' && row.revenueGrowth && parseFloat(row.revenueGrowth) <= 10 && parseFloat(row.revenueGrowth) > 5) || (filters.stockPerformance === 'Low' && row.revenueGrowth && parseFloat(row.revenueGrowth) <= 5)) &&
      (filters.buyerHolder === '' || (filters.buyerHolder === 'Institutional' && row.marketCap && parseFloat(row.marketCap) > 10) || (filters.buyerHolder === 'Retail' && row.marketCap && parseFloat(row.marketCap) <= 10)) &&
      (filters.mutualFundHolders === '' || (filters.mutualFundHolders === 'High' && row.marketCap && parseFloat(row.marketCap) > 20) || (filters.mutualFundHolders === 'Medium' && row.marketCap && parseFloat(row.marketCap) <= 20 && parseFloat(row.marketCap) > 5) || (filters.mutualFundHolders === 'Low' && row.marketCap && parseFloat(row.marketCap) <= 5)) &&
      (filters.growth === '' || (filters.growth === 'High' && row.profitGrowth && parseFloat(row.profitGrowth) > 15) || (filters.growth === 'Medium' && row.profitGrowth && parseFloat(row.profitGrowth) <= 15 && parseFloat(row.profitGrowth) > 8) || (filters.growth === 'Low' && row.profitGrowth && parseFloat(row.profitGrowth) <= 8));

    return matchesSearchTerm && matchesFilters;
  });

  if (loading) {
    return <div>Loading Financial data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="financial-section-container">
      <div className="header-controls">
        <h2>Financial</h2>
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
      <div className="filters">
        {/* same filters */}
      </div>
      
      <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <tr>
              <th colSpan="6">About</th>
              <th colSpan="6">Location</th>
              <th colSpan="7">Finance</th>
            </tr>
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Domain</th>
              <th>Industry</th>
              <th>Full Time employees</th>
              <th>Investor Website</th>
              
              <th>Exchange</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Contact</th>
              
              <th>Date & Time</th>
              <th>Current Price</th>
              <th>Market Cap</th>
              <th>Total Revenue</th>
              <th>Revenue Growth</th>
              <th>Profit Growth</th>
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
                <td>{row.fullTimeEmployees}</td>
                <td>{row.investorWebsite}</td>
                
                {/* Location */}
                <td>{row.exchange}</td>
                <td>{row.address}</td>
                <td>{row.city}</td>
                <td>{row.state}</td>
                <td>{row.country}</td>
                <td>{row.contact}</td>
                
                {/* Finance */}
                <td>{row.dateTime}</td>
                <td>{row.currentPrice}</td>
                <td>{row.marketCap}</td>
                <td>{row.totalRevenue}</td>
                <td>{row.revenueGrowth}</td>
                <td>{row.profitGrowth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <style>{`
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

export default Financial;
