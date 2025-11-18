import React, { useState, useEffect } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
 
const fakeintentDataRaw = [
];
  // This fake data is no longer used and can be removed.


const Intent = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/intent');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Intent data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const filteredData = tableData
    .filter(row =>
      !searchTerm || Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aMatches = rowMatchesSearch(a, searchTerm);
      const bMatches = rowMatchesSearch(b, searchTerm);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['companyName', 'intentStatus'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'intent_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div>Loading Intent data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="intent-container">
      <div className="header-actions">
        <h2>Intent</h2>
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

      <div className="table-container">
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Account Name</th>
              <th>Intent Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => {
              const isHighlighted = rowMatchesSearch(row, searchTerm);
              return (
                <tr key={idx} style={{ backgroundColor: isHighlighted ? '#fefce8' : 'transparent' }}>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.companyName, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.intentStatus)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.intentStatus, searchTerm)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Tooltip tooltip={tooltip} />

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

        th:nth-child(1), td:nth-child(1) { width: 70%; }
        th:nth-child(2), td:nth-child(2) { width: 30%; }

        td { position: relative; }

        td:hover { background-color: #f9fafb; }

        th { background-color: #f8f9fa; font-weight: 600; }

        tr:hover { background-color: #f5f5f5; }
      `}</style>
    </div>
  );
};

export default Intent;
