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
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
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
    .filter(row => {
      const searchMatch = !searchTerm || Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
      const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(row.intentStatus);
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      const aMatches = rowMatchesSearch(a, searchTerm);
      const bMatches = rowMatchesSearch(b, searchTerm);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  const getUniqueIntentStatuses = () => {
    if (!tableData) return [];
    const statuses = tableData.map(item => item.intentStatus).filter(status => status && status.trim());
    return [...new Set(statuses)].sort();
  };

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusDropdown]);

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



      <div className="table-container" style={{ backgroundColor: '#e8eef7' }}>
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Account Name</th>
              <th style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                <span>Intent Status</span>
                <span style={{ fontSize: '10px', border: '1px solid #d1d5db', padding: '2px 6px', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', height: '20px', flexShrink: 0 }}>▼</span>
                {showStatusDropdown && getUniqueIntentStatuses().length > 0 && (
                  <div className="status-dropdown-container" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', zIndex: 1000 }}>
                    <div style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      minWidth: '250px',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                          Select Intent Status
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {selectedStatuses.length} selected
                        </div>
                        {selectedStatuses.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStatuses([]);
                            }}
                            style={{
                              marginTop: '8px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div style={{ padding: '8px' }}>
                        {getUniqueIntentStatuses().map(status => (
                          <label key={status} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'background-color 0.15s ease'
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <input
                              type="checkbox"
                              checked={selectedStatuses.includes(status)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusToggle(status);
                              }}
                              style={{ marginRight: '8px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '13px', color: '#374151' }}>{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </th>
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
          width: 95%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        th, td {
          padding: 12px 15px;
          border-bottom: 1px solid #ddd;
          white-space: nowrap;
          overflow: visible;
          text-overflow: ellipsis;
          cursor: default;
          background-color: #f8f9fa;
        }

        th {
          text-align: left;
          background-color: #f8f9fa;
        }

        td {
          text-align: left;
          overflow: hidden;
        }

        th:nth-child(1), td:nth-child(1) { width: 50%; }
        th:nth-child(2), td:nth-child(2) { width: 100%; }

        td { position: relative; }

        td:hover { background-color: #f9fafb; }

        th { font-weight: 600; background-color: #e8eef7 !important; }

        tbody tr:hover { background-color: #f5f5f5; }
      `}</style>
    </div>
  );
};

export default Intent;
