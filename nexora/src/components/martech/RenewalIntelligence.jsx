import { useState, useEffect } from 'react';

const RenewalIntelligence = () => {
    const [filters, setFilters] = useState({
        companyName: '',
        product: '',
        qtr: ''
    });
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

    // Fetch renewal data when company is selected
    useEffect(() => {
        setLoading(true);
        const fetchRenewalData = async () => {
            try {
                // If a company is selected, add it as a query parameter. Otherwise, fetch all data.
                const url = filters.companyName ? `/api/renewal-intelligence?companyName=${encodeURIComponent(filters.companyName)}` : '/api/renewal-intelligence';
                const response = await fetch(url);
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

    const getUniqueCompanies = () => {
        if (!tableData) return [];
        const allCompanies = tableData.map(item => item.companyName);
        return [...new Set(allCompanies)].sort();
    };

    const getUniqueProducts = () => {
        if (!tableData) return [];
        const allProducts = tableData.map(item => item.product);
        return [...new Set(allProducts)].sort();
    };

    const getUniqueQtrs = () => {
        if (!tableData) return [];
        const allQtrs = tableData.map(item => item.qtr);
        return [...new Set(allQtrs)].sort();
    };

    const filteredData = tableData.filter(row => {
        const companyMatch = !filters.companyName || row.companyName === filters.companyName;
        const productMatch = !filters.product || row.product === filters.product;
        const qtrMatch = !filters.qtr || row.qtr === filters.qtr;
        return companyMatch && productMatch && qtrMatch;
    });

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

        const chartArray = Object.entries(qtrCounts).map(([qtr, count]) => ({
            label: qtr,
            value: count,
            color: colors[qtr] || '#9ca3af'
        }));

        // Sort quarters from future to past (2026 first, then 2025, etc.)
        // Within each year, sort Q1, Q2, Q3, Q4
        chartArray.sort((a, b) => {
            const parseQtr = (qtrStr) => {
                const match = qtrStr.match(/Q(\d+)\s(\d{4})/);
                if (!match) return { year: 0, quarter: 0 };
                return { year: parseInt(match[2]), quarter: parseInt(match[1]) };
            };

            const aQtr = parseQtr(a.label);
            const bQtr = parseQtr(b.label);

            // Sort by year descending (future first), then by quarter ascending (Q1, Q2, Q3, Q4)
            if (aQtr.year !== bQtr.year) {
                return bQtr.year - aQtr.year;
            }
            return aQtr.quarter - bQtr.quarter;
        });

        return chartArray;
    };

    const chartData = getChartData();
    const maxChartValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;

    return (
        <div className="renewal-intelligence-container">
            <div className="header-actions">
                <h2>Renewal Intelligence</h2>
            </div>

            <div className="section-subtle-divider" />

            <div className="filters">
                <div className="filter-group">
                    <label>Account Name</label>
                    <select
                        value={filters.companyName}
                        onChange={(e) => handleFilterChange('companyName', e.target.value)}
                    >
                        <option value="">All</option>
                        {getUniqueCompanies().map(company => (
                            <option key={company} value={company}>
                                {company}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Product</label>
                    <select
                        value={filters.product}
                        onChange={(e) => handleFilterChange('product', e.target.value)}
                    >
                        <option value="">All</option>
                        {getUniqueProducts().map(product => (
                            <option key={product} value={product}>
                                {product}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Renewal QTR</label>
                    <select
                        value={filters.qtr}
                        onChange={(e) => handleFilterChange('qtr', e.target.value)}
                    >
                        <option value="">All</option>
                        {getUniqueQtrs().map(qtr => (
                            <option key={qtr} value={qtr}>
                                {qtr}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', minWidth: 0 }}>
                {/* Table Section - Left */}
                <div style={{ minWidth: 0 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Loading data...
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {filters.companyName || filters.product || filters.qtr ? 'No data available' : 'Select filters to view renewal data'}
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <colgroup>
                                    <col style={{ width: '40%' }} />
                                    <col style={{ width: '15%' }} />
                                    <col style={{ width: '20%' }} />
                                </colgroup>
                                <thead className="sticky-header">
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Account Name</th>
                                        <th style={{ textAlign: 'left' }}>Product</th>
                                        <th style={{ textAlign: 'left' }}>Renewal QTR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={index}>
                                            <td style={{ textAlign: 'left' }} onMouseEnter={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                setTooltip({
                                                    show: true,
                                                    text: row.companyName,
                                                    x: rect.right - 20,
                                                    y: rect.bottom + 20
                                                });
                                            }} onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}>
                                                {row.companyName}
                                            </td>
                                            <td onMouseEnter={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                setTooltip({
                                                    show: true,
                                                    text: row.product,
                                                    x: rect.right - 20,
                                                    y: rect.bottom + 20
                                                });
                                            }} onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}>
                                                {row.product}
                                            </td>
                                            <td onMouseEnter={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                setTooltip({
                                                    show: true,
                                                    text: row.qtr,
                                                    x: rect.right - 20,
                                                    y: rect.bottom + 20
                                                });
                                            }} onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}>
                                                {row.qtr}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Bar Chart Section - Right */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '15px',
                    border: '1px solid #d1d5db',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    flexShrink: 0,
                    height: '400px'
                }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '15px', margin: 0 }}>
                        Renewal Distribution
                    </h2>
                    {filteredData.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            color: '#9ca3af',
                            fontSize: '12px'
                        }}>
                            Select filters
                        </div>
                    ) : chartData.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            color: '#9ca3af',
                            fontSize: '12px'
                        }}>
                            No data
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            flex: 1,
                            gap: '4px',
                            minWidth: 0
                        }}>
                            {chartData.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '4px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.value}
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        maxWidth: '30px',
                                        height: maxChartValue > 0 ? `${(item.value / maxChartValue) * 250}px` : '0px',
                                        backgroundColor: item.color,
                                        borderRadius: '2px 2px 0 0',
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
                                        fontSize: '8px',
                                        color: '#6b7280',
                                        marginTop: '4px',
                                        textAlign: 'center',
                                        maxWidth: '50px',
                                        wordWrap: 'break-word',
                                        lineHeight: '1.1'
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

            <style jsx>{`
                .renewal-intelligence-container {
                    background: linear-gradient(180deg, #ffffff, #fafbff);
                    border-radius: 12px;
                    padding: 1.25rem 1.5rem 1.5rem;
                    box-shadow: 0 6px 20px rgba(27, 39, 94, 0.08);
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                }

                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .header-actions h2 {
                    margin: 0;
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #0f172a;
                }

                .table-container {
                    height: 400px;
                    /* remove horizontal scroll and keep vertical scroll only */
                    overflow-x: hidden;
                    overflow-y: auto;
                    position: relative;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    background-color: #fff;
                }

                .sticky-header {
                    position: sticky;
                    top: 0;
                    background-color: #f8f9fa;
                    z-index: 10;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                /* keep THs non-sticky individually to avoid width/offset misalignment */
                .sticky-header th {
                    position: relative;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    min-width: 0;
                    box-sizing: border-box;
                }

                th, td {
                    padding: 3px 6px;
                    font-size: 13px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    cursor: default;
                    box-sizing: border-box;
                }

                /* Explicitly enforce column width constraints so Renewal QTR is visible */
                td:nth-child(1), th:nth-child(1) { width: 20%; }
                td:nth-child(2), th:nth-child(2) { width: 40%; }
                td:nth-child(3), th:nth-child(3) { width: 40%; }

                td {
                    position: relative;
                }

                td:hover {
                    background-color: #f9fafb;
                }

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

export default RenewalIntelligence;
