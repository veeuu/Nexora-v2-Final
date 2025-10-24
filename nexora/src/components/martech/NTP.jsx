import React, { useState, useEffect } from 'react';

const NTP = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    companyName: '',
    technology: '',
    purchasePrediction: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [modalContent, setModalContent] = useState(null);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'companyName', 'domain', 'category', 'technology',
      'purchaseProbability', 'purchasePrediction', 'ntpAnalysis'
    ];

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
    link.setAttribute('download', 'ntp_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ntp');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch NTP data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].sort();
  };

  const filteredData = tableData.filter(row => {
    const filterMatches = Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      // The data from MongoDB might have different casing or field names
      const rowKey = key === 'companyName' ? 'companyName' : key;
      return String(row[rowKey]) === filters[key];
    });

    const searchMatches = Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filterMatches && searchMatches;
  });

  const handleAnalysisClick = (analysis) => {
    setModalContent(analysis);
  };

  if (loading) {
    return <div>Loading NTP data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="ntp-container">
      <div className="header-actions">
        <h2>NTP</h2>
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
            {getUniqueOptions('companyName').map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        
        
        <div className="filter-group">
          <label>Purchase Prediction</label>
          <select 
            value={filters.purchasePrediction}
            onChange={(e) => handleFilterChange('purchasePrediction', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('purchasePrediction').map(prediction => (
              <option key={prediction} value={prediction}>{prediction}</option>
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
            {getUniqueOptions('category').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Technology</label>
          <select 
            value={filters.technology}
            onChange={(e) => handleFilterChange('technology', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('technology').map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>

      </div>
      
      <div className="table-container">
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Company Name</th>
              <th>Domain</th> {/* Domain column remains */}
              <th>Category</th>
              <th>Technology</th>
              <th>Purchase Probability (%)</th>
              <th>Purchase Prediction</th>
              <th>NTP Analysis</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.companyName}</td>
                <td>{row.domain}</td> {/* Domain column */}
                <td>{row.category}</td>
                <td>{row.technology}</td>
                <td>{row.purchaseProbability}</td>
                <td>{row.purchasePrediction}</td>
                <td 
                  onClick={() => handleAnalysisClick(row.ntpAnalysis)} 
                  style={{ cursor: 'pointer', color: '#010810ff', textDecoration: 'underline' }}
                >{row.ntpAnalysis ? `${row.ntpAnalysis.substring(0, 30)}...` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalContent && (
        <div className="modal-overlay" onClick={() => setModalContent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>NTP Analysis</h3>
            <p>{modalContent}</p>
            <button onClick={() => setModalContent(null)}>Close</button>
          </div>
        </div>
      )}

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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .modal-content h3 {
          margin-top: 0;
        }

        .modal-content p {
          white-space: pre-wrap; /* Allows text to wrap inside the modal */
          word-break: break-word;
        }

        .modal-content button {
          margin-top: 15px;
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .modal-content button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default NTP;
