import { useState, useEffect } from 'react';
import { useIndustry } from '../../context/IndustryContext';

const Technographics = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setIndustryData, setTechnologyData, setAvailableRegions } = useIndustry();
  const [filters, setFilters] = useState({
    companyName: '',
    region: '',
    technology: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredData = tableData.filter(row => {
    const filterMatches = Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      return String(row[key]) === filters[key];
    });

    const searchMatches = Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filterMatches && searchMatches;
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
            {getUniqueOptions('companyName').map(name => (
              <option key={name} value={name}>{name}</option>
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
            {getUniqueOptions('region').map(region => (
              <option key={region} value={region}>{region}</option>
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
          <select value={filters.technology} onChange={(e) => handleFilterChange('technology', e.target.value)}>
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
              <th>Domain</th>
              <th>Industry</th>
              <th>Region</th>
              <th>Category</th>
              <th>Technology</th>
              <th>Previous Detected Date</th>
              <th>Latest Detected Date</th>
              <th>Renewal Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.companyName}</td>
                <td>{row.domain}</td>
                <td>{row.industry}</td>
                <td>{row.region}</td>
                <td>{row.category}</td>
                <td>{row.technology}</td>
                <td>{row.previousDetectedDate}</td>
                <td>{row.latestDetectedDate}</td>
                <td>{row.renewalDate}</td>
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

export default Technographics;