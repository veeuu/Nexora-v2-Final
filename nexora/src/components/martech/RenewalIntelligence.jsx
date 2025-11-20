import { useState, useEffect } from 'react';

const RenewalIntelligence = () => {
    const [filters, setFilters] = useState({
        companyName: '',
    });
    const [companies, setCompanies] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

    // Fetch companies on component mount
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('/api/companies');
                const data = await response.json();
                setCompanies(data);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };
        fetchCompanies();
    }, []);

    // Fetch renewal data when company is selected
    useEffect(() => {
        if (!filters.companyName) {
            setTableData([]);
            return;
        }

        setLoading(true);
        const fetchRenewalData = async () => {
            try {
                const response = await fetch(`/api/renewal-intelligence?companyId=${filters.companyName}`);
                const data = await response.json();
                setTableData(data);
            } catch (error) {
                console.error('Error fetching renewal data:', error);
                setTableData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRenewalData();
    }, [filters.companyName]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredData = tableData;

    // Calculate chart data from filtered data
    const getChartData = () => {
        const qtrCounts = {};
        const colors = {
            'Q1 2025': '#3b82f6',
            'Q2 2025': '#1e3a8a',
            'Q3 2025': '#f97316',
            'Q4 2025': '#7c3aed'
        };

        filteredData.forEach(row => {
            const qtr = row.qtr || 'Unknown';
            qtrCounts[qtr] = (qtrCounts[qtr] || 0) + 1;
        });

        return Object.entries(qtrCounts).map(([qtr, count]) => ({
            label: qtr,
            value: count,
            color: colors[qtr] || '#9ca3af'
        }));
    };

    const chartData = getChartData();
    const maxChartValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                    Renewal Intelligence
                </h1>
            </div>

            {/* Filters Section */}
            <div className="filters">
                <div className="filter-group">
                    <label>Company Name</label>
                    <select
                        value={filters.companyName}
                        onChange={(e) => handleFilterChange('companyName', e.target.value)}
                    >
                        <option value="">All</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table and Chart Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Table Section */}
                <div className="table-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            Loading data...
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                            {filters.companyName ? 'No data available' : 'Select a company to view renewal data'}
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Company Name</th>
                                    <th>Product</th>
                                    <th>Renewal Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, index) => (
                                    <tr key={index}>
                                        <td
                                            onMouseEnter={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                setTooltip({
                                                    show: true,
                                                    text: row.companyName,
                                                    x: rect.right - 20,
                                                    y: rect.bottom + 20
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                        >
                                            {row.companyName}
                                        </td>
                                        <td
                                            onMouseEnter={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                setTooltip({
                                                    show: true,
                                                    text: row.product,
                                                    x: rect.right - 20,
                                                    y: rect.bottom + 20
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                        >
                                            {row.product}
                                        </td>
                                        <td
                                            onMouseEnter={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                setTooltip({
                                                    show: true,
                                                    text: row.renewalDate,
                                                    x: rect.right - 20,
                                                    y: rect.bottom + 20
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                        >
                                            {row.renewalDate}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Bar Chart Section */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '20px', margin: 0 }}>
                        Renewal Distribution
                    </h2>
                    {filteredData.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '300px',
                            color: '#9ca3af',
                            fontSize: '14px'
                        }}>
                            Select a company to view chart
                        </div>
                    ) : chartData.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '300px',
                            color: '#9ca3af',
                            fontSize: '14px'
                        }}>
                            No data to display
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-around',
                            height: '300px',
                            gap: '15px',
                            flex: 1
                        }}>
                            {chartData.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '8px'
                                    }}>
                                        {item.value}
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: maxChartValue > 0 ? `${(item.value / maxChartValue) * 250}px` : '0px',
                                        backgroundColor: item.color,
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.target.style.opacity = '0.8';
                                            e.target.style.transform = 'scaleY(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.opacity = '1';
                                            e.target.style.transform = 'scaleY(1)';
                                        }}
                                    ></div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        marginTop: '8px',
                                        textAlign: 'center',
                                        maxWidth: '80px',
                                        wordWrap: 'break-word'
                                    }}>
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
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
                    {tooltip.text}
                </div>
            )}
        </div>
    );
};

export default RenewalIntelligence;
