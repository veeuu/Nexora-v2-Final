import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';

// --- Custom Tooltip Component (Light Theme) ---
const CustomTooltip = ({ active, payload, label, timeRange }) => {
  if (active && payload && payload.length) {
    const isIntraday = timeRange === '1D';
    const closeData = payload.find(p => p.dataKey === 'Close');
    const openData = payload.find(p => p.dataKey === 'Open');
    const highData = payload.find(p => p.dataKey === 'High');
    const lowData = payload.find(p => p.dataKey === 'Low');
    const volumeData = payload.find(p => p.dataKey === 'Volume');

    return (
      <div style={{ backgroundColor: '#fff', color: '#333', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <p className="label" style={{ fontWeight: 'bold' }}>{label}</p>
        {openData && <p style={{ color: '#8884d8' }}>{`Open: ${openData.value.toFixed(2)}`}</p>}
        {closeData && <p style={{ color: closeData.stroke }}>{`Close: ${closeData.value.toFixed(2)}`}</p>}
        {highData && <p style={{ color: '#FF7300' }}>{`High: ${highData.value.toFixed(2)}`}</p>}
        {lowData && <p style={{ color: '#0088FE' }}>{`Low: ${lowData.value.toFixed(2)}`}</p>}
        {volumeData && <p style={{ color: '#555' }}>{`Volume: ${volumeData.value.toLocaleString()}`}</p>}
      </div>
    );
  }
  return null;
};


const Summary = () => {
  // State for company selection and time range
  const [financialData, setFinancialData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [timeRange, setTimeRange] = useState('1D'); // Default to 1D
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('line'); // 'line' or 'candlestick'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to parse string numbers like "$20.63" or "1.2M"
  const parseNumericValue = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const cleanedValue = value.replace(/[^0-9.-]/g, '');
    return parseFloat(cleanedValue) || 0;
  };

  // Fetch data whenever company or timeRange changes
  // 1. Fetch initial data for the dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/financial/wide', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const sanitizedData = data.map(company => ({
          ...company,
          dailyPerformance: {
            ...company.dailyPerformance,
            open: parseNumericValue(company.dailyPerformance.open),
            high: parseNumericValue(company.dailyPerformance.high),
            low: parseNumericValue(company.dailyPerformance.low),
            close: parseNumericValue(company.dailyPerformance.close),
          }
        }));
        setFinancialData(sanitizedData);
        if (sanitizedData.length > 0) {
          setSelectedCompany(sanitizedData[0]);
        }
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Financial data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // 2. Generate chart data when the selected company or time range changes
  useEffect(() => {
    if (!selectedCompany || !selectedCompany.id) {
      return;
    }

    const fetchChartData = async () => {
      try {
        setLoading(true);
        console.log('Fetching chart data for:', selectedCompany.id, timeRange);
        const response = await fetch(`/api/stock/${selectedCompany.id}/${timeRange}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Chart data received:', data.length, 'data points');
        
        // Format the 'Time' for display on the X-axis
        const formattedData = data.map(item => {
          const date = new Date(item.Time);
          let timeFormat;

          // Select the best format based on the selected time range
          switch (timeRange) {
            case '1D':
              timeFormat = 'HH:mm'; // e.g., "14:30"
              break;
            case '5D':
              timeFormat = 'MMM d, p'; // e.g., "Jan 5, 2:30 PM"
              break;
            case '1M':
            case '3M':
              timeFormat = 'MMM d'; // e.g., "Jan 5"
              break;
            default: // 6M, YTD, 1Y, 5Y
              timeFormat = 'MMM yyyy'; // e.g., "Jan 2023"
              break;
          }
          return { ...item, Time: format(date, timeFormat) };
        });

        setChartData(formattedData);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch chart data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [selectedCompany, timeRange]);

  // 3. Poll for real-time data on the 1D view
  useEffect(() => {
    if (timeRange !== '1D' || !selectedCompany?.id) {
      return; // Do nothing if not on 1D view or no company is selected
    }

    // Add a small delay before starting polling to ensure backend is ready
    const startDelay = setTimeout(() => {
      const realTimeInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/stock/quote/${selectedCompany.id}`, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          if (!response.ok) {
            // Don't throw an error, just log it, so one failed poll doesn't break the UI
            console.error(`Real-time poll failed: ${response.status}`);
            return;
          }
          const latestQuote = await response.json();
        
        setChartData(currentData => {
          if (currentData.length === 0) {
            return currentData; // Don't update if initial data isn't loaded yet
          }

          const lastDataPoint = currentData[currentData.length - 1];
          const newTime = format(new Date(latestQuote.Time), 'HH:mm');

          // If the latest data point is for a new minute, add it
          if (lastDataPoint.Time !== newTime) {
            return [...currentData, { ...latestQuote, Time: newTime }];
          }

          // Otherwise, update the last data point
          const updatedData = [...currentData];
          updatedData[updatedData.length - 1] = { ...latestQuote, Time: newTime };
          return updatedData;
        });
        } catch (e) {
          console.error("Failed to poll real-time data:", e);
        }
      }, 5000); // Poll every 5 seconds

      // Store interval ID for cleanup
      return () => clearInterval(realTimeInterval);
    }, 2000); // Wait 2 seconds before starting polling

    return () => clearTimeout(startDelay); // Cleanup timeout on component unmount or when deps change
  }, [selectedCompany, timeRange]);

  // Handle dropdown change
  const handleCompanyChange = (event) => {
    const selectedCompanyName = event.target.value;
    const company = financialData.find(c => c.companyName === selectedCompanyName);
    setSelectedCompany(company);
  };

  // Determine chart price extremes
  const prices = chartData.map(d => d.Close).filter(p => p);
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.99 : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.01 : 100;
  
  // Determine the primary color (Green for gain, Red for loss)
  const isGain = chartData.length > 1 && (chartData[chartData.length - 1].Close || chartData[chartData.length - 1].Price) >= (chartData[0].Open || chartData[0].Close);
  const primaryColor = isGain ? '#4CAF50' : '#F44336'; // Standard Green/Red

  const isIntraday = timeRange === '1D';

  // --- Render Charting Component based on Time Range ---
  const renderChart = () => {
    if (!selectedCompany) {
      console.log('No company selected');
      return null;
    }
    
    console.log('Rendering chart with', chartData.length, 'data points');
    console.log('First data point:', chartData[0]);
    console.log('Chart data sample:', chartData.slice(0, 3));
    console.log('Data keys:', chartData[0] ? Object.keys(chartData[0]) : 'No data');
    console.log('Close values:', chartData.slice(0, 5).map(d => d.Close));
    
    if (chartData.length === 0) {
      return <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>No data available</div>;
    }

    // Check if data has required fields
    const hasValidData = chartData.every(d => 
      d.Close !== undefined && 
      d.Open !== undefined && 
      d.High !== undefined && 
      d.Low !== undefined
    );

    if (!hasValidData) {
      console.error('Invalid data structure:', chartData[0]);
      return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Data format error - check console</div>;
    }

    return (
      <LineChart
        width={800}
        height={350}
        data={chartData}
        margin={{ top: 10, right: 60, left: 10, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis 
          dataKey="Time" 
          tick={{ fill: '#666', fontSize: 12 }} 
          stroke="#000"
        />
        <YAxis
          tick={{ fill: '#666', fontSize: 12 }}
          stroke="#000"
          orientation="right"
        />
        <Tooltip />
        <Legend />
        
        <Line 
          type="monotone" 
          dataKey="Close" 
          stroke="#E74C3C" 
          strokeWidth={2} 
          dot={false} 
          name="Closing Price"
        />
        <Line 
          type="monotone" 
          dataKey="High" 
          stroke="#FF9800" 
          strokeDasharray="5 5" 
          strokeWidth={1.5} 
          dot={false} 
          name="Daily High"
        />
        <Line 
          type="monotone" 
          dataKey="Low" 
          stroke="#2196F3" 
          strokeDasharray="5 5" 
          strokeWidth={1.5} 
          dot={false} 
          name="Daily Low"
        />
        <Line 
          type="monotone" 
          dataKey="Open" 
          stroke="#9C27B0" 
          strokeDasharray="5 5" 
          strokeWidth={1.5} 
          dot={false} 
          name="Opening Price"
        />
      </LineChart>
    );
  };

  const lastDataPoint = chartData[chartData.length - 1] || {};

  return (
    <div className="summary-container" style={{ padding: '20px', backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>Stock Performance Summary (Real-Time Data)</h2>

      {/* Company Selector and Time Range Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        
        {/* Company Selection Dropdown */}
        <div className="company-selector" style={{ flex: '1 1 auto', minWidth: '250px' }}>
            <label htmlFor="company-select" style={{ marginRight: '10px', fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Company:</label>
            <select
            id="company-select"
            onChange={handleCompanyChange}
            value={selectedCompany ? selectedCompany.companyName : ''}
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', width: '100%', maxWidth: '400px', backgroundColor: '#f5f5f5', color: '#333' }}
            disabled={loading || error}
            >
            <option value="">-- Please choose a company --</option>
            {financialData.map((company) => (
                <option key={company.companyName} value={company.companyName}>
                {company.companyName}
                </option>
            ))}
            </select>
        </div>
        
        {/* Time Range Selector Buttons */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 12px',
                borderRadius: '5px',
                border: timeRange === range ? '1px solid #4CAF50' : '1px solid #ccc',
                backgroundColor: timeRange === range ? '#4CAF50' : '#f5f5f5',
                color: timeRange === range ? '#ffffff' : '#333',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0s', 
                fontSize: '14px',
                minWidth: '50px'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>Loading summary...</div>}
      {error && <div style={{ textAlign: 'center', padding: '50px', color: 'red', fontSize: '16px' }}>Error: {error}<br/><button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}>Refresh Page</button></div>}
      {!loading && !error && (!selectedCompany || chartData.length === 0) ? (
        <div className="empty-component" style={{ textAlign: 'center', padding: '50px', border: '1px dashed #ccc', borderRadius: '5px', color: '#666' }}>
          <p>Please select a company to view its stock performance trend.</p>
          {selectedCompany && chartData.length === 0 && <p style={{ marginTop: '10px', color: '#999' }}>Loading chart data...</p>}
        </div>
      ) : (
        <>
          {/* --- Live Price Display --- */}
          <div className="live-price-section" style={{ marginBottom: '20px', paddingLeft: '5px' }}>
            {(() => {
              const currentPrice = lastDataPoint.Close;
              const openingPrice = chartData.length > 0 ? chartData[0].Open : 0;
              const priceChange = currentPrice - openingPrice;
              const percentageChange = openingPrice !== 0 ? (priceChange / openingPrice) * 100 : 0;
              const isPositive = priceChange >= 0;

              if (typeof currentPrice !== 'number') {
                return null;
              }

              return (
                <>
                  <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 'bold', color: '#1f2937' }}>
                    {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', flexWrap: 'wrap' }}>
                    <span style={{ color: isPositive ? '#16a34a' : '#dc2626', fontWeight: '500' }}>
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}
                    </span>
                    <span style={{ color: isPositive ? '#16a34a' : '#dc2626', fontWeight: '500' }}>
                      ({isPositive ? '+' : ''}{percentageChange.toFixed(2)}%)
                    </span>
                  </div>
                  <div style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', color: '#6b7280', marginTop: '8px' }}>
                    As of {format(new Date(), 'h:mm:ss a')} {new Date().toLocaleDateString(undefined, { day: '2-digit', timeZoneName: 'short' }).substring(3)}. Market Open.
                  </div>
                </>
              );
            })()}
          </div>
          {/* --- End Live Price Display --- */}

          <h3 style={{ marginBottom: '15px', color: '#555', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>
            {selectedCompany ? selectedCompany.companyName : '...'} | Showing {timeRange} Trend
            {timeRange === '1D' && (
              <span className="live-indicator">
                <span className="live-dot"></span>
                Live
              </span>
            )}
          </h3>
          <div style={{ width: '100%', height: '400px', minHeight: '400px', backgroundColor: '#ffffff', padding: '20px', border: '1px solid #000000', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
          
          {/* Stock Info Bar */}
          <div className="stock-info" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', padding: '15px', borderTop: '1px solid #eee', marginTop: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #eee' }}>
                  <strong style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>Open:</strong> <br /> 
                  <span style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)' }}>{selectedCompany ? selectedCompany.currency : ''} {lastDataPoint.Open ? lastDataPoint.Open.toFixed(2) : 'N/A'}</span>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #eee' }}>
                  <strong style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>High:</strong> <br /> 
                  <span style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)' }}>{selectedCompany ? selectedCompany.currency : ''} {lastDataPoint.High ? lastDataPoint.High.toFixed(2) : 'N/A'}</span>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #eee' }}>
                  <strong style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>Low:</strong> <br /> 
                  <span style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)' }}>{selectedCompany ? selectedCompany.currency : ''} {lastDataPoint.Low ? lastDataPoint.Low.toFixed(2) : 'N/A'}</span>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #eee' }}>
                  <strong style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>Close:</strong> <br /> 
                  <span style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)' }}>{selectedCompany ? selectedCompany.currency : ''} {lastDataPoint.Close ? lastDataPoint.Close.toFixed(2) : 'N/A'}</span>
              </div>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                  <strong style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>Volume:</strong> <br /> 
                  <span style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)' }}>{lastDataPoint.Volume ? lastDataPoint.Volume.toLocaleString() : (selectedCompany ? selectedCompany.dailyPerformance.volume : 'N/A')}</span>
              </div>
          </div>
        </>
      )}
      <style>{`
        .live-indicator {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          background-color: #fdecec; /* Light red background */
          color: #c53030; /* Dark red text */
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #f56565; /* Red dot */
          border-radius: 50%;
          margin-right: 6px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(245, 101, 101, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(245, 101, 101, 0);
          }
          100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(245, 101, 101, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default Summary;