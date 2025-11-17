import React, { useState, useEffect } from 'react';

const fakeintentDataRaw = [
  { accountName: 'Barbeques Galore Pty Limited', intentStatus: 'High' },
  { accountName: 'Bhavana Tech Business Solutions Pvt Ltd', intentStatus: 'High' },
  { accountName: 'DSO National Laboratories', intentStatus: 'Low' },
  { accountName: 'AERODYNE GROUP', intentStatus: 'Low' },
  { accountName: 'Thales Solutions Asia Pte. Ltd.', intentStatus: 'Low' },
  { accountName: 'GISTDA (Geo-informatics and Space Technology Development Agency)', intentStatus: 'Low' },
  { accountName: 'UPECA AEROTECH SDN. BHD.', intentStatus: 'Low' },
  { accountName: 'GAMAFORCE UGM', intentStatus: 'Low' },
  { accountName: 'Raytheon', intentStatus: 'Low' },
  { accountName: 'Boeing', intentStatus: 'Low' },
  { accountName: 'Lockheed Martin', intentStatus: 'Low' },
  { accountName: 'General Dynamics', intentStatus: 'Low' },
  { accountName: 'Northrop Grumman', intentStatus: 'Low' },
  { accountName: 'Collins Aerospace', intentStatus: 'Low' },
  { accountName: 'L3Harris Technologies', intentStatus: 'Low' },
  { accountName: 'Pratt & Whitney', intentStatus: 'Low' },
  { accountName: 'Textron', intentStatus: 'Low' },
  { accountName: 'Cafe coffee day', intentStatus: 'High-Medium' },
  { accountName: 'DAGANG NEXCHANGE BERHAD', intentStatus: 'High' },
  { accountName: 'Dentsu', intentStatus: 'Medium' },
  { accountName: 'Direc Business Technologies Inc.', intentStatus: 'High' },
  { accountName: 'Direct Group', intentStatus: 'High-Medium' },
  { accountName: 'Gadens', intentStatus: 'Medium' },
  { accountName: 'GENTING BHD.', intentStatus: 'Medium' },
  { accountName: 'Ginni Systems Ltd', intentStatus: 'High-Medium' },
  { accountName: 'Glencore International AG', intentStatus: 'Medium' },
  { accountName: 'HOLCIM', intentStatus: 'High-Medium' },
  { accountName: 'INFYNIX', intentStatus: 'High' },
  { accountName: 'Innovsource Pvt. Ltd.', intentStatus: 'High-Medium' },
  { accountName: 'inoday Consultancy Services (P) Ltd', intentStatus: 'High-Medium' },
  { accountName: 'Inovant Technologies', intentStatus: 'High' },
  { accountName: 'Inquizity', intentStatus: 'High-Medium' },
  { accountName: 'Inspace Technologies Private Limited', intentStatus: 'High-Medium' },
  { accountName: 'Inspedia', intentStatus: 'High' },
  { accountName: 'Instillmotion Labs pvt. ltd.', intentStatus: 'High' },
  { accountName: 'Insynchq, Inc.', intentStatus: 'High-Medium' },
  { accountName: 'INTACTIT INFOSYSTEMS PVT LTD', intentStatus: 'High-Medium' },
  { accountName: 'Integrated Computer Systems, Inc.', intentStatus: 'High' },
  { accountName: 'Integrated Global Solutions Sdn Bhd (IGS)', intentStatus: 'High' },
  { accountName: 'Integrated Risk Insurance Brokers Limited', intentStatus: 'High' },
  { accountName: 'Intelivita', intentStatus: 'High-Medium' },
  { accountName: 'Intellection', intentStatus: 'High' },
  { accountName: 'Intelligent Business Computer Systems Pvt Ltd,', intentStatus: 'Medium' },
  { accountName: 'Intelligistic Technologies LLP', intentStatus: 'High' },
  { accountName: 'Interact Technology Sdn Bhd', intentStatus: 'High-Medium' },
  { accountName: 'Interactive Brokers', intentStatus: 'Medium' },
  { accountName: 'interactivebees', intentStatus: 'High' },
  { accountName: 'Interdeals Automation Sdn Bhd', intentStatus: 'High' },
  { accountName: 'Interlinx Automation Sdn Bhd', intentStatus: 'High' },
  { accountName: 'International Institute of Population Science', intentStatus: 'High-Medium' },
  { accountName: 'Interpole Technologies Pvt. Ltd.', intentStatus: 'High-Medium' },
  { accountName: 'Interview Cracker', intentStatus: 'High' },
  { accountName: 'Intime solutions', intentStatus: 'High-Medium' },
  { accountName: 'Intrious Technology Sdn Bhd', intentStatus: 'High' },
  { accountName: 'Invanos Web Solutions', intentStatus: 'High-Medium' },
  { accountName: 'Inventindia', intentStatus: 'High-Medium' },
  { accountName: 'INVENTIZ ENTERPRISES', intentStatus: 'Medium' },
  { accountName: 'iTuple Technologies', intentStatus: 'High-Medium' },
  { accountName: 'IVTREE', intentStatus: 'High-Medium' },
  { accountName: 'IXI International', intentStatus: 'High' },
  { accountName: 'iXie Gaming', intentStatus: 'High' },
  { accountName: 'IXS', intentStatus: 'High-Medium' },
  { accountName: 'Ixsight', intentStatus: 'Medium' },
  { accountName: 'Jaaji Software Technologies Private Limited', intentStatus: 'Medium' },
  { accountName: 'Jainson Infotech', intentStatus: 'Medium' },
  { accountName: 'Jannpaul', intentStatus: 'High' },
  { accountName: 'Jash Entertainment', intentStatus: 'High' }
];

const intent = () => {
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // For now use fake data; later will fetch real data
    const normalize = (s) => {
      if (!s) return '';
      const lower = String(s).toLowerCase();
      if (lower.includes('high')) return 'High';
      if (lower.includes('low')) return 'Low';
      if (lower.includes('medi')) return 'Medium';
      return s;
    };

    const mapped = fakeintentDataRaw.map(r => ({ companyName: r.accountName, intentStatus: normalize(r.intentStatus) }));
    setTableData(mapped);
  }, []);

  const filteredData = tableData.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['companyName','intentStatus'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g,'""')}"`).join(','))
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
            {filteredData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.companyName}</td>
                <td>{row.intentStatus}</td>
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
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; white-space: nowrap; }
        th { background-color: #f8f9fa; font-weight: 600; }
        tr:hover { background-color: #f5f5f5; }
      `}</style>
    </div>
  );
};

export default intent;
