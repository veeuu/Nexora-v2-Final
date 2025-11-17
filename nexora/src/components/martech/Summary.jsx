import React, { useMemo, useState, useCallback } from 'react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

// --- Color Manipulation Utility ---
const hexToHsl = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
};

const adjustColor = (hex, deltaL, deltaS) => {
    let { h, s, l } = hexToHsl(hex);
    l = Math.max(0, Math.min(100, l + deltaL));
    s = Math.max(0, Math.min(100, s + deltaS));
    return `hsl(${h}, ${s}%, ${l}%)`;
};

const allCompaniesData = {
    TechCorp: {
        industries: [
            { label: 'Information Technology', value: 57, color: '#1e90ff' },
            { label: 'Marketing & Advertising', value: 29, color: '#1f2937' },
            { label: 'Financial Services', value: 7, color: '#f59e0b' },
            { label: 'Retail', value: 4, color: '#10b981' },
            { label: 'Telecom', value: 2, color: '#ef4444' },
            { label: 'Other', value: 1, color: '#8b5cf6' },
        ],
        countries: [{ country: 'USA', techFocus: 'IT', value: 57 }],
        continents: [
            { id: 'north-america', city: 'New York', color: 'dodgerblue', coordinates: [40.7128, -74.006], value: 57 },
            { id: 'europe', city: 'London', color: 'mediumseagreen', coordinates: [51.5074, -0.1278], value: 29 },
            { id: 'asia', city: 'Singapore', color: 'gold', coordinates: [1.3521, 103.8198], value: 14 },
        ],
    },
    InnovateX: {
        industries: [
            { label: 'Marketing & Advertising', value: 40, color: '#1f2937' },
            { label: 'Software', value: 30, color: '#1e90ff' },
            { label: 'Sales', value: 20, color: '#f59e0b' },
            { label: 'E-commerce', value: 10, color: '#10b981' },
        ],
        countries: [{ country: 'Germany', techFocus: 'Marketing', value: 22 }],
        continents: [
            { id: 'north-america', city: 'San Francisco', color: 'dodgerblue', coordinates: [37.773972, -122.431297], value: 48 },
            { id: 'europe', city: 'Berlin', color: 'mediumseagreen', coordinates: [52.52, 13.405], value: 22 },
            { id: 'asia', city: 'Tokyo', color: 'gold', coordinates: [35.6762, 139.6503], value: 30 },
        ],
    },
    DataFlow: {
        industries: [
            { label: 'Data Platform', value: 38, color: '#8b5cf6' },
            { label: 'Analytics', value: 32, color: '#22c55e' },
            { label: 'Financial Services', value: 20, color: '#f59e0b' },
            { label: 'Consulting', value: 10, color: '#ef4444' },
        ],
        countries: [{ country: 'India', techFocus: 'Analytics', value: 40 }],
        continents: [
            { id: 'north-america', city: 'Chicago', color: 'dodgerblue', coordinates: [41.8781, -87.6298], value: 35 },
            { id: 'europe', city: 'Paris', color: 'mediumseagreen', coordinates: [48.8566, 2.3522], value: 25 },
            { id: 'asia', city: 'Bengaluru', color: 'gold', coordinates: [12.9716, 77.5946], value: 40 },
        ],
    },
    WebGenius: {
        industries: [
            { label: 'Information Technology', value: 60, color: '#1e90ff' },
            { label: 'Design Services', value: 25, color: '#1f2937' },
            { label: 'Other', value: 15, color: '#8b5cf6' },
        ],
        countries: [{ country: 'UK', techFocus: 'CMS', value: 25 }],
        continents: [
            { id: 'north-america', city: 'Toronto', color: 'dodgerblue', coordinates: [43.6532, -79.3832], value: 50 },
            { id: 'europe', city: 'London', color: 'mediumseagreen', coordinates: [51.5074, -0.1278], value: 35 },
            { id: 'asia', city: 'Shanghai', color: 'gold', coordinates: [31.2304, 121.4737], value: 15 },
        ],
    },
    EvolveCo: {
        industries: [
            { label: 'Financial Services', value: 50, color: '#f59e0b' },
            { label: 'Information Technology', value: 30, color: '#1e90ff' },
            { label: 'Other', value: 20, color: '#8b5cf6' },
        ],
        countries: [{ country: 'Brazil', techFocus: 'Finance', value: 50 }],
        continents: [
            { id: 'north-america', city: 'Mexico City', color: 'dodgerblue', coordinates: [19.4326, -99.1332], value: 40 },
            { id: 'europe', city: 'Dublin', color: 'mediumseagreen', coordinates: [53.3498, -6.2603], value: 20 },
            { id: 'south-america', color: 'red', coordinates: [-23.5505, -46.6333], value: 40 },
        ],
    },
};

// Simplified data structure for the heatmap — only BI Tools, Cloud, SAP, OS, VMware
const countryTechData = {
    India: { Cloud: 85, SAP: 75, OS: 65, VMware: 55, 'BI Tools': 60 },
    USA: { Cloud: 95, SAP: 60, OS: 80, VMware: 70, 'BI Tools': 82 },
    Germany: { Cloud: 75, SAP: 90, OS: 70, VMware: 85, 'BI Tools': 64 },
    UK: { Cloud: 80, SAP: 65, OS: 75, VMware: 60, 'BI Tools': 70 },
    Japan: { Cloud: 70, SAP: 80, OS: 85, VMware: 75, 'BI Tools': 61 },
    Brazil: { Cloud: 65, SAP: 70, OS: 60, VMware: 80, 'BI Tools': 56 }
};

// Array of available countries for the dropdown
const availableCountries = Object.keys(countryTechData);

// Modified to use blue colors for all categories and products
const getSankeyData = () => {
    return {
        nodes: [
            { id: 'Technologies', value: 498, color: '#1f2937' },
            { id: 'Marketing', value: 188, color: '#3b82f6' }, // Blue
            { id: 'CRM', value: 101, color: '#3b82f6' }, // Blue
            { id: 'Sales', value: 78, color: '#3b82f6' }, // Blue
            { id: 'No Detection', value: 50, color: '#3b82f6' }, // Blue

            { id: 'hubspot', value: 50, color: '#3b82f6' }, // Blue
            { id: 'google analytics', value: 40, color: '#3b82f6' }, // Blue
            { id: 'Salesforce Marketing', value: 30, color: '#3b82f6' }, // Blue
            { id: 'Google Ads', value: 20, color: '#3b82f6' }, // Blue

            { id: 'Salesforce', value: 45, color: '#3b82f6' }, // Blue
            { id: 'Pipedrive', value: 25, color: '#3b82f6' }, // Blue

            { id: 'Zoominfo', value: 30, color: '#3b82f6' },
        ],
        links: [
            { source: 'Technologies', target: 'Marketing', value: 188 },
            { source: 'Technologies', target: 'CRM', value: 101 },
            { source: 'Technologies', target: 'Sales', value: 78 },
            { source: 'Technologies', target: 'No Detection', value: 50 },

            { source: 'Marketing', target: 'hubspot', value: 50 },
            { source: 'Marketing', target: 'google analytics', value: 40 },
            { source: 'Marketing', target: 'Salesforce Marketing', value: 30 },
            { source: 'Marketing', target: 'Google Ads', value: 20 },

            { source: 'CRM', target: 'Salesforce', value: 45 },
            { source: 'CRM', target: 'Pipedrive', value: 25 },

            { source: 'Sales', target: 'Zoominfo', value: 30 },
        ],
    };
};

const aggregateWorldMapData = (data) => {
    const continentMap = {};
    Object.values(data).forEach((company) => {
        company.continents.forEach((continent) => {
            if (continentMap[continent.id]) {
                continentMap[continent.id].value += continent.value;
            } else {
                continentMap[continent.id] = { ...continent };
            }
        });
    });
    return Object.values(continentMap);
};

const CHART_HEIGHT = 420;
const COLUMN_X = {
    Technologies: 100,
    Category: 220,
    Products: 380,
};
const NODE_WIDTH = 150;
const NODE_VERTICAL_SPACING = 35;

const LINK_STROKE_WIDTH = 2;

const generateSimpleLinkPath = (x1, y1, x2, y2) => {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX + 20} ${y1}, ${midX - 20} ${y2}, ${x2} ${y2}`;
};

const SankeyGraph = ({ data }) => {
    const [hoveredNode, setHoveredNode] = useState(null);
    const { nodes, links } = data;

    const rawNodeMap = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes]);

    const techNode = nodes.find(n => n.id === 'Technologies');
    const categories = nodes.filter(n => ['Marketing', 'CRM', 'Sales', 'No Detection'].includes(n.id));
    const products = nodes.filter(n => !['Technologies', 'Marketing', 'CRM', 'Sales', 'No Detection'].includes(n.id));

    const totalTechnologies = techNode?.value || 1;
    const maxCategoryValue = Math.max(...categories.map(c => c.value), 1);
    const maxProductValue = Math.max(...products.map(p => p.value), 1);

    const nodePositions = useMemo(() => {
        const positions = new Map();

        let currentY = 50;

        categories.forEach(cat => {
            const outgoingLinks = links.filter(l => l.source === cat.id);
            const categoryStartBlockY = currentY;

            let productYSum = 0;
            let productCount = 0;

            outgoingLinks.forEach(link => {
                const productCenterY = currentY + NODE_VERTICAL_SPACING / 2;

                positions.set(link.target, {
                    ...rawNodeMap.get(link.target),
                    y: productCenterY,
                    linkThickness: 20,
                });

                productYSum += productCenterY;
                productCount++;
                currentY += NODE_VERTICAL_SPACING;
            });

            const categoryCenterY = productCount > 0
                ? productYSum / productCount
                : categoryStartBlockY + (NODE_VERTICAL_SPACING / 2);

            positions.set(cat.id, {
                ...cat,
                y: categoryCenterY,
                linkThickness: 20,
            });

            currentY += NODE_VERTICAL_SPACING * 0.5;
        });

        const categoryNodes = categories.map(c => positions.get(c.id)).filter(n => n);
        const totalYSum = categoryNodes.reduce((sum, n) => sum + n.y, 0);
        const technologiesCenterY = categoryNodes.length > 0 ? totalYSum / categoryNodes.length : CHART_HEIGHT / 2;

        positions.set('Technologies', {
            ...techNode,
            y: technologiesCenterY,
            linkThickness: 20,
        });

        return positions;
    }, [nodes, links, rawNodeMap, categories, techNode]);

    const isLinkHighlighted = (sourceId, targetId) => {
        return hoveredNode === sourceId || hoveredNode === targetId;
    };

    const renderLink = (link) => {
        const sourceNode = nodePositions.get(link.source);
        const targetNode = nodePositions.get(link.target);

        if (!sourceNode || !targetNode) return null;

        const sourceX = link.source === 'Technologies'
            ? COLUMN_X.Technologies + 50
            : COLUMN_X.Category + NODE_WIDTH;

        const targetX = link.target === 'Marketing' || link.target === 'CRM' || link.target === 'Sales' || link.target === 'No Detection'
            ? COLUMN_X.Category : COLUMN_X.Products;

        const sourceY = sourceNode.y;
        const targetY = targetNode.y;

        const color = targetNode.color;

        const path = generateSimpleLinkPath(sourceX, sourceY, targetX, targetY);

        const highlighted = isLinkHighlighted(link.source, link.target);

        return (
            <path
                key={`${link.source}-${link.target}`}
                d={path}
                stroke={color}
                strokeWidth={highlighted ? LINK_STROKE_WIDTH * 2 : LINK_STROKE_WIDTH}
                fill="none"
                opacity={highlighted ? 0.8 : 0.3}
                style={{ transition: 'stroke-width 0.15s ease-out, opacity 0.15s ease-out' }}
            />
        );
    };

    const renderNode = (node, max, column, align = 'left') => {
        const nodePos = nodePositions.get(node.id);
        if (!nodePos) return null;

        let x;

        if (column === 'Technologies') {
            x = COLUMN_X.Technologies - 50;
        } else if (column === 'Category') {
            x = COLUMN_X.Category;
        } else {
            x = COLUMN_X.Products;
        }

        const barWidth = column === 'Technologies' ? '100px' : `${NODE_WIDTH}px`;

        return (
            <div
                key={node.id}
                style={{
                    ...sankeyStyles.nodeWrapper(x, nodePos.y),
                    width: column === 'Products' ? '300px' : barWidth,
                    transform: hoveredNode === node.id ? 'translateY(-50%) scale(1.02)' : 'translateY(-50%) scale(1)',
                    boxShadow: hoveredNode === node.id ? `0 0 8px -2px ${node.color}` : 'none',
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
            >
                {column !== 'Products' && (
                    <>
                        <div style={sankeyStyles.nodeLabel(align)}>{node.id}</div>
                        <div style={sankeyStyles.nodeBarContainer}>
                            <div style={sankeyStyles.nodeBar(node.value, max, node.color)} />
                        </div>
                        <div style={sankeyStyles.nodeValue(align)}>{node.value}</div>
                    </>
                )}

                {column === 'Products' && (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div style={{ flex: 1, ...sankeyStyles.nodeLabel('left') }}>{node.id}</div>
                        <div style={{ flex: 2, ...sankeyStyles.nodeBarContainer }}>
                            <div style={sankeyStyles.nodeBar(node.value, max, node.color)} />
                        </div>
                        <div style={{ flex: 1, ...sankeyStyles.nodeValue('left') }}>{node.value}</div>
                    </div>
                )}
            </div>
        );
    };

    const sankeyStyles = {
        container: {
            position: 'relative',
            height: `${CHART_HEIGHT}px`,
            width: '100%',
            padding: '20px 10px',
            overflow: 'auto',
            minWidth: '100%',
        },
        svgOverlay: {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5,
        },
        nodeWrapper: (x, y) => ({
            position: 'absolute',
            width: `${NODE_WIDTH}px`,
            top: `${y}px`,
            left: `${x}px`,
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
            transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
            zIndex: 10,
        }),
        nodeBarContainer: {
            height: '20px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden',
        },
        nodeBar: (value, max, color) => ({
            height: '100%',
            width: `${(value / max) * 100}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease',
        }),
        nodeLabel: (align) => ({
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '2px',
            textAlign: align,
        }),
        nodeValue: (align) => ({
            fontSize: '11px',
            color: '#6b7280',
            marginTop: '2px',
            textAlign: align,
        }),
    };


    return (
        <div style={sankeyStyles.container}>
            <svg style={sankeyStyles.svgOverlay}>
                {links.map(renderLink)}
            </svg>

            <h3 style={{ position: 'absolute', top: '10px', left: `${COLUMN_X.Category}px`, fontSize: '14px', color: '#6b7280' }}>Category</h3>
            <h3 style={{ position: 'absolute', top: '10px', left: `${COLUMN_X.Products}px`, fontSize: '14px', color: '#6b7280' }}>Products</h3>

            {techNode && renderNode(techNode, totalTechnologies, 'Technologies', 'center')}
            {categories.map(cat => renderNode(cat, maxCategoryValue, 'Category', 'left'))}
            {products.map(prod => renderNode(prod, maxProductValue, 'Products', 'left'))}
        </div>
    );
};

const chartStyle = {
    height: '350px',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2 rgb(0 0 0 / 0.1)',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid #e5e7eb',
};

const WorldMap = ({ data }) => (
    <div style={chartStyle}>
        <h4 style={{ margin: '0 0 10px', color: '#374151' }}>World Map: Global Footprint (Placeholder)</h4>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
            **Geographical distribution** of the aggregated data, highlighting regions by count or revenue.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '12px' }}>
            *Data points aggregated across {data.length} continents.*
        </p>
    </div>
);

// Updated HeatMap Component
const HeatMap = () => {
    // Initialize state to 'India' as requested
    const [country, setCountry] = useState('India');

    // Function to calculate color based on value (0-100 scale)
    const getColor = (value) => {
        // Darker color for higher value, lighter for lower (Light Blue to Dark Blue gradient)
        const maxR = 29, maxG = 78, maxB = 216; // Dark Blue: #1D4ED8
        const minR = 224, minG = 242, minB = 254; // Light Blue: #E0F2FE

        const scale = value / 100;

        const r = Math.floor(minR + (maxR - minR) * scale);
        const g = Math.floor(minG + (maxG - minG) * scale);
        const b = Math.floor(minB + (maxB - minB) * scale);

        return `rgb(${r}, ${g}, ${b})`;
    };

    // Get data for selected country
    const countryData = country && countryTechData[country] ? countryTechData[country] : null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full">

            {/* Country Dropdown */}
            <div className="mb-6">
                <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Country :
                </label>
                <select
                    id="country-select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                >
                    {availableCountries.map((countryName) => (
                        <option key={countryName} value={countryName}>
                            {countryName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Heatmap Display */}
            {countryData ? (
                    <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        {Object.entries(countryData).map(([tech, value]) => {
                            // Blue gradient color: lighter at low %, darker at high %
                            const color = getColor(value);

                            // text color for percentage on right: keep dark to be readable
                            const pctStyle = { fontWeight: 700, color: '#0f172a' };

                            return (
                                <div key={tech} className="p-2 rounded-md transition-all duration-150" title={`${tech}: ${value}% adoption`}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{tech}</div>
                                        <div style={pctStyle}>{value}%</div>
                                    </div>
                                    <div style={{ height: '10px', width: '100%', backgroundColor: '#e6f0ff', borderRadius: 6, marginTop: 8, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${value}%`, backgroundColor: color, transition: 'width 0.4s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-gray-400 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-600">
                        {country ? `No data available for "${country}".` : 'Select a country to see the technology adoption heatmap.'}
                    </p>
                </div>
            )}
        </div>
    );
};

// --- Chart Constants ---
const PIE_RADIUS = 95;
const SVG_SIZE = 300;
const PIE_CENTER = SVG_SIZE / 2;

// NEW CONSTANTS FOR RADIAL LABELS
const LABEL_LINE_LENGTH = 15; // Length of the short radial line
const LABEL_TEXT_OFFSET = 5;  // Space between the line end and the text

// --- Component for the SVG Pie Annotations ---
const PieAnnotations = React.memo(({ data, total, hoveredLabel }) => {
    let cumulativeAngle = 0;

    return (
        <svg
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
            {data.map((segment, index) => {
                const segmentAngle = (segment.value / total) * 360;
                const midAngle = cumulativeAngle + segmentAngle / 2;

                // Adjust angle so 0 is at 12 o'clock (top)
                const midAngleRad = (midAngle - 90) * (Math.PI / 180);

                // Start of the line (just outside the pie slice)
                const startX = PIE_CENTER + Math.cos(midAngleRad) * PIE_RADIUS;
                const startY = PIE_CENTER + Math.sin(midAngleRad) * PIE_RADIUS;

                // End of the line (radial distance out)
                const endRadius = PIE_RADIUS + LABEL_LINE_LENGTH;
                const endX = PIE_CENTER + Math.cos(midAngleRad) * endRadius;
                const endY = PIE_CENTER + Math.sin(midAngleRad) * endRadius;

                // Position for the text label
                const textRadius = endRadius + LABEL_TEXT_OFFSET;
                const textX = PIE_CENTER + Math.cos(midAngleRad) * textRadius;
                const textY = PIE_CENTER + Math.sin(midAngleRad) * textRadius;


                const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;

                cumulativeAngle += segmentAngle;

                // Don't draw line for very small segments
                if (segmentAngle < 3) return null;

                const isDimmed = hoveredLabel && hoveredLabel !== segment.label;
                const lineColor = isDimmed ? '#d1d5db' : segment.color;
                const textColor = isDimmed ? '#9ca3af' : '#1f2937';

                // Determine text anchor based on angle for clean placement
                let textAnchor = 'middle';
                if (midAngle > 20 && midAngle < 160) {
                    textAnchor = 'start'; // Right side
                } else if (midAngle > 200 && midAngle < 340) {
                    textAnchor = 'end'; // Left side
                }

                return (
                    <g key={index}>
                        <path
                            d={pathData}
                            stroke={lineColor}
                            strokeWidth="2"
                            fill="none"
                            opacity={isDimmed ? 0.8 : 1}
                            strokeLinecap="round"
                        />
                        {/* Display the value (Count) near the slice */}
                        <text
                            x={textX}
                            y={textY}
                            textAnchor={textAnchor}
                            fontSize="11px"
                            fill={textColor}
                            fontWeight="600"
                            dominantBaseline="middle"
                            style={{ pointerEvents: 'none', transition: 'fill 0.1s ease' }}
                        >
                            {segment.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
});

// --- FIXED DATA FOR PIE CHART (MODIFIED) ---
const overallIndustryPieData = [
    { label: 'Information Technology', value: 147, color: '#64B5F6' }, // Light Blue
    { label: 'Financial Services', value: 77, color: '#1565C0' }, // Dark Blue
    { label: 'Marketing & Advertising', value: 32, color: '#4CAF50' },// Deep Purple (Changed from Red)
    { label: 'Data Platform', value: 38, color: '#FF9800' }, // Orange
    { label: 'Other', value: 36, color: '#FDD835' }, // Yellow// Green
    { label: 'Software', value: 30, color: '#00897B' },
    { label: 'Analytics', value: 69, color: '#673AB7' }, // Teal (Added to match total from image values)
].sort((a, b) => b.value - a.value);

const Summary = () => {
    const overallSankeyData = useMemo(() => getSankeyData(), []);
    const overallMapData = useMemo(() => aggregateWorldMapData(allCompaniesData), []);
    const overallHeatMapData = useMemo(() => Object.values(allCompaniesData).map(c => c.countries[0]), []);

    const [hoveredPieData, setHoveredPieData] = useState(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

    const totalValue = overallIndustryPieData.reduce((sum, s) => sum + s.value, 0) || 1;

    // Function to get the color for the pie segment or legend
    // Updated logic: Initially all segments are dark, when hovering only the hovered segment is dark
    const getSegmentColor = useCallback((item, isHovered) => {
        if (hoveredPieData) {
            // When any segment is hovered
            if (isHovered) {
                return item.color; // Keep the hovered segment dark
            } else {
                // Make non-hovered segments lighter
                return adjustColor(item.color, 20, -20);
            }
        } else {
            // No segment is hovered, so all segments are dark
            return item.color;
        }
    }, [hoveredPieData]);

    const pieBackground = useMemo(() => {
        let current = 0;
        const segments = overallIndustryPieData.map((s) => {
            const start = (current / totalValue) * 360;
            current += s.value;
            const end = (current / totalValue) * 360;

            const isThisSegmentHovered = s.label === hoveredPieData?.label;
            const color = getSegmentColor(s, isThisSegmentHovered);

            return `${color} ${start}deg ${end}deg`;
        }).join(', ');
        return `conic-gradient(${segments})`;
    }, [overallIndustryPieData, totalValue, hoveredPieData, getSegmentColor]);

    const handlePieMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left - centerX;
        const y = e.clientY - rect.top - centerY;

        setHoverPosition({ x: e.clientX, y: e.clientY });

        const distance = Math.sqrt(x * x + y * y);
        if (distance > PIE_RADIUS) {
            setHoveredPieData(null);
            return;
        }

        let angle = Math.atan2(y, x) * 180 / Math.PI;
        angle = (angle + 90 + 360) % 360;

        let currentAngle = 0;
        for (let i = 0; i < overallIndustryPieData.length; i++) {
            const segmentAngle = (overallIndustryPieData[i].value / totalValue) * 360;
            if (angle >= currentAngle && angle < currentAngle + segmentAngle) {
                setHoveredPieData({
                    ...overallIndustryPieData[i],
                    percentage: ((overallIndustryPieData[i].value / totalValue) * 100).toFixed(0),
                });
                return;
            }
            currentAngle += segmentAngle;
        }
        setHoveredPieData(null);
    };

    const handlePieMouseLeave = () => {
        setHoveredPieData(null);
    };

    const styles = {
        overallSummary: {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            padding: '20px',
            backgroundColor: '#f4f4f9',
            maxWidth: '100%',
            overflowX: 'hidden',
        },
        title: {
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '10px',
        },
        divider: {
            height: '1px',
            backgroundColor: '#e5e7eb',
            margin: '15px 0 30px 0',
        },
        grid2up: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
            gap: '20px',
            marginBottom: '20px',
        },
        summaryPanel: {
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4 rgb(0 0 0 / 0.1)',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            maxWidth: '100%',
            overflow: 'hidden',
        },
        panelTitle: {
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '15px',
            borderBottom: '1px solid #f3f4f6',
            paddingBottom: '10px',
        },
        summaryPie: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            gap: '30px',
            padding: '10px',
            minHeight: '300px',
            flexWrap: 'wrap',
        },
        pieContainer: {
            width: `${SVG_SIZE}px`,
            height: `${SVG_SIZE}px`,
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
        },
        pieGraphic: {
            width: `${PIE_RADIUS * 2}px`,
            height: `${PIE_RADIUS * 2}px`,
            borderRadius: '50%',
            position: 'absolute',
            top: PIE_CENTER - PIE_RADIUS,
            left: PIE_CENTER - PIE_RADIUS,
            transition: 'all 0.1s ease-in-out',
            border: '2px solid white',
            boxShadow: '0 0 5px rgba(0,0,0,0.1)',
        },
        pieOverlay: {
            position: 'absolute',
            top: PIE_CENTER - PIE_RADIUS,
            left: PIE_CENTER - PIE_RADIUS,
            width: `${PIE_RADIUS * 2}px`,
            height: `${PIE_RADIUS * 2}px`,
            borderRadius: '50%',
            cursor: 'pointer',
        },
        summaryLegend: {
            listStyle: 'none',
            padding: '0',
            margin: '0',
            flex: '1 1 200px',
            minWidth: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
            paddingLeft: '10px',
        },
        legendItem: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '5px',
            fontSize: '14px',
            color: '#4b5563',
            padding: '2px 0',
            cursor: 'default',
            transition: 'color 0.1s ease, font-weight 0.1s ease',
        },
        dot: (color) => ({
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            marginRight: '8px',
            backgroundColor: color,
            border: '1px solid rgba(0,0,0,0.2)',
        }),
        label: {
            flexGrow: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        value: {
            fontWeight: '600',
            color: '#1f2937',
            marginLeft: '10px',
        },
    };

    return (
        <div style={styles.overallSummary}>
            <style>{`
                @media (max-width: 768px) {
                    .summary-pie-responsive {
                        flex-direction: column !important;
                        align-items: center !important;
                        height: auto !important;
                        padding: 5px !important;
                    }
                    .summary-legend-responsive {
                        width: 100% !important;
                        max-width: 100% !important;
                        padding-left: 0 !important;
                        margin-top: 20px;
                    }
                    .sankey-container-responsive {
                        overflow-x: auto !important;
                        -webkit-overflow-scrolling: touch;
                    }
                }
                @media (max-width: 480px) {
                    .pie-container-responsive {
                        transform: scale(0.7);
                    }
                    .summary-pie-responsive {
                        padding: 0 !important;
                    }
                }
            `}</style>
            <h2 style={styles.title}>Technology Summary</h2>
            <div style={styles.divider} />

            <div style={styles.grid2up}>
                <div style={styles.summaryPanel}>
                    <div style={styles.panelTitle}>Technology Stack Breakdown</div>
                    <div className="sankey-container-responsive">
                        <SankeyGraph data={overallSankeyData} />
                    </div>
                </div>

                <div style={styles.summaryPanel}>
                    <div style={styles.panelTitle}>Industry Wise Distribution</div>
                    <div style={styles.summaryPie} className="summary-pie-responsive">
                        {/* PIE CHART SECTION */}
                        <div style={styles.pieContainer} className="pie-container-responsive">
                            {/* SVG for Annotations (Lines and Values) */}
                            <PieAnnotations data={overallIndustryPieData} total={totalValue} hoveredLabel={hoveredPieData?.label} />

                            <div
                                style={{ ...styles.pieGraphic, backgroundImage: pieBackground }}
                                onMouseMove={handlePieMouseMove}
                                onMouseLeave={handlePieMouseLeave}
                            >
                                {/* Center circle removed - no total number displayed */}
                            </div>
                        </div>

                        {/* LEGEND SECTION */}
                        <ul style={styles.summaryLegend} className="summary-legend-responsive">
                            {overallIndustryPieData.map((item, index) => {
                                const isHovered = item.label === hoveredPieData?.label;
                                return (
                                    <li
                                        key={item.label}
                                        style={{
                                            ...styles.legendItem,
                                            fontWeight: isHovered ? '700' : '400',
                                            color: isHovered ? '#1f2937' : '#4b5563',
                                            backgroundColor: isHovered ? '#f9fafb' : 'transparent',
                                            borderRadius: '4px',
                                        }}
                                        onMouseEnter={() => setHoveredPieData({ ...item, percentage: ((item.value / totalValue) * 100).toFixed(0) })}
                                        onMouseLeave={() => setHoveredPieData(null)}
                                    >
                                        <div style={styles.dot(getSegmentColor(item, isHovered))} />
                                        <span style={styles.label}>{item.label}</span>
                                        <span style={styles.value}>{item.value}</span>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* TOOLTIP (Conditional rendering based on hoveredPieData) */}
                        {hoveredPieData && (
                            <div
                                style={{
                                    position: 'fixed', // Use fixed to ensure it appears over everything
                                    top: hoverPosition.y + 15,
                                    left: hoverPosition.x + 15,
                                    padding: '8px 12px',
                                    backgroundColor: 'rgba(0,0,0,0.85)',
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    pointerEvents: 'none',
                                    zIndex: 100,
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <strong>{hoveredPieData.label}</strong> ({hoveredPieData.percentage}%)
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.summaryPanel}>
                    <div style={styles.panelTitle}>Intent distribution</div>
                    {/* Intent distribution table (counts based on provided image) */}
                    <div style={{ padding: '10px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '250px', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#bfdbfe' }}>
                                    <th style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Intent Status</th>
                                    <th style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Total Accounts</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Medium</td>
                                    <td style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>29</td>
                                </tr>
                                <tr style={{ background: '#f3f4f6' }}>
                                    <td style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Low</td>
                                    <td style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>26</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>High</td>
                                    <td style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>15</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontWeight: 700, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Total</td>
                                    <td style={{ padding: 'clamp(8px, 2vw, 10px)', border: '1px solid #e5e7eb', fontWeight: 700, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>70</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={styles.summaryPanel}>
                    <div style={styles.panelTitle}>Technology Adoption</div>
                    <HeatMap data={overallHeatMapData} />
                </div>
            </div>
        </div>
    );
};

export default Summary;