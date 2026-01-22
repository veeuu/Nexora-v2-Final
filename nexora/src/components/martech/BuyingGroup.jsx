import { useState, useEffect } from 'react';
import img1 from './assests/1Rivet_India.png';
import img2 from './assests/2Base_Technologies_Pvt_Ltd_India.png';
import img3 from './assests/2Coms_Consulting_INDIA.png';
import img4 from './assests/3I_Infotech_Consultancy_Ltd_India.png';
import img5 from './assests/4DCompass_InfoSolutions_Private_Limited_INDIA.png';
import img6 from './assests/4G_Identity_Solutions_Pvt_Limited_India.png';
import img7 from './assests/10XDS_INDIA.png';
import img8 from './assests/42Gears_Mobility_Systems_Pvt_Limited_India.png';
import img9 from './assests/300_Innovative_Solutions_INDIA.png';
import img10 from './assests/Cpl3_Bhingar_Urban_Bank_Galaxy_Office_Automation_India.png';

const BuyingGroup = () => {
    // Parse CSV data
    const parseCSV = (csvText) => {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = {};

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index]?.trim();
            });

            const companyId = parseInt(row.companyId);
            if (!data[companyId]) {
                data[companyId] = [];
            }

            data[companyId].push({
                id: row.personName.toLowerCase().replace(/\s+/g, '-'),
                name: row.personName,
                designation: row.designation,
                email: row.email,
                linkedin: row.linkedin,
                position: {
                    x: parseInt(row.positionX),
                    y: parseInt(row.positionY),
                    width: parseInt(row.positionWidth),
                    height: parseInt(row.positionHeight)
                }
            });
        }

        return data;
    };

    // Company data with imported images
    const companyData = [
        {
            id: 1,
            name: '#CPL3-Bhingar Urban Bank-Galaxy Office Automation',
            imageUrl: img10
        },
        {
            id: 2,
            name: '10XDS',
            imageUrl: img7
        },
        {
            id: 3,
            name: '1Rivet',
            imageUrl: img1
        },
        {
            id: 4,
            name: '2Base Technologies Pvt. Ltd',
            imageUrl: img2
        },
        {
            id: 5,
            name: '2Coms Consulting',
            imageUrl: img3
        },
        {
            id: 6,
            name: '300 Innovative Solutions',
            imageUrl: img9
        },
        {
            id: 7,
            name: '3I Infotech Consultancy Ltd',
            imageUrl: img4
        },
        {
            id: 8,
            name: '42Gears Mobility Systems Pvt Limited',
            imageUrl: img8
        },
        {
            id: 9,
            name: '4DCompass InfoSolutions Private Limited',
            imageUrl: img5
        },
        {
            id: 10,
            name: '4G Identity Solutions Pvt. Limited',
            imageUrl: img6
        },
    ];

    const [selectedCompany, setSelectedCompany] = useState(companyData[0].id);
    const [imageError, setImageError] = useState(false);
    const [hoveredPerson, setHoveredPerson] = useState(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [isPopupHovered, setIsPopupHovered] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [personDetailsData, setPersonDetailsData] = useState({});

    // Load CSV data on component mount
    useEffect(() => {
        const loadCSV = async () => {
            try {
                const response = await fetch('/src/data/personDetails.csv');
                const csvText = await response.text();
                const parsedData = parseCSV(csvText);
                setPersonDetailsData(parsedData);
            } catch (error) {
                console.error('Error loading CSV:', error);
            }
        };

        loadCSV();
    }, []);

    const currentCompany = companyData.find(company => company.id === selectedCompany);
    const currentPersons = personDetailsData[selectedCompany] || [];

    const handleCompanyChange = (e) => {
        setSelectedCompany(parseInt(e.target.value));
        setImageError(false);
        setHoveredPerson(null);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if mouse is over any person box
        const person = currentPersons.find(p => {
            const scale = rect.width / 1000; // Assuming image width is ~1000px
            const posX = p.position.x * scale;
            const posY = p.position.y * scale;
            const posWidth = p.position.width * scale;
            const posHeight = p.position.height * scale;

            return x >= posX && x <= posX + posWidth && y >= posY && y <= posY + posHeight;
        });

        if (person) {
            setHoveredPerson(person);
            setPopupPosition({ x, y });
        }
    };

    const handleContainerMouseLeave = () => {
        setHoveredPerson(null);
        setIsPopupHovered(false);
    };

    const handlePopupMouseEnter = () => {
        setIsPopupHovered(true);
    };

    const handlePopupMouseLeave = () => {
        setIsPopupHovered(false);
        setHoveredPerson(null);
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="buying-group-container" style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
            <h1 style={{ fontSize: 'clamp(1.2rem, 2vw, 1.4rem)', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
                Buying Group
            </h1>

            {/* Filter Section */}
            <div className="filters" style={{ marginBottom: '20px' }}>
                <div className="filter-group">
                    <label>Company Name</label>
                    <select
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                    >
                        {companyData.map(company => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Image Container */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '500px',
                position: 'relative'
            }}>
                {currentCompany && (
                    <div
                        onMouseLeave={handleContainerMouseLeave}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}>
                        {imageError ? (
                            <p style={{ color: '#9ca3af', fontSize: '16px' }}>Image not available</p>
                        ) : (
                            <>
                                <img
                                    src={currentCompany.imageUrl}
                                    alt={currentCompany.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '600px',
                                        objectFit: 'contain',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                    onError={handleImageError}
                                    onMouseMove={handleMouseMove}
                                />

                                {/* Hover Popup */}
                                {hoveredPerson && (
                                    <div
                                        onMouseEnter={handlePopupMouseEnter}
                                        onMouseLeave={handlePopupMouseLeave}
                                        style={{
                                            position: 'absolute',
                                            left: `${popupPosition.x}px`,
                                            top: `${popupPosition.y}px`,
                                            backgroundColor: 'white',
                                            border: '2px solid #3b82f6',
                                            borderRadius: '8px',
                                            padding: '12px 16px',
                                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                                            zIndex: 1000,
                                            minWidth: '300px',
                                            transform: 'translate(-50%, -110%)',
                                            pointerEvents: 'auto'
                                        }}
                                    >
                                        <div style={{ marginBottom: '8px' }}>
                                            <p style={{
                                                margin: '0 0 4px 0',
                                                fontSize: '16px',
                                                fontWeight: '700',
                                                color: '#1f2937'
                                            }}>
                                                {hoveredPerson.name}
                                            </p>
                                            <p style={{
                                                margin: '0 0 8px 0',
                                                fontSize: '13px',
                                                color: '#3b82f6',
                                                fontWeight: '500'
                                            }}>
                                                {hoveredPerson.designation}
                                            </p>
                                        </div>

                                        <div style={{
                                            borderTop: '1px solid #e5e7eb',
                                            paddingTop: '8px'
                                        }}>
                                            <p style={{
                                                margin: '0 0 6px 0',
                                                fontSize: '12px',
                                                color: '#6b7280'
                                            }}>
                                                <strong>Email:</strong>
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '10px'
                                            }}>
                                                <p style={{
                                                    margin: '0',
                                                    fontSize: '12px',
                                                    color: '#374151',
                                                    wordBreak: 'break-all',
                                                    flex: 1
                                                }}>
                                                    {hoveredPerson.email}
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(hoveredPerson.email, 'email')}
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '11px',
                                                        backgroundColor: copiedField === 'email' ? '#10b981' : '#f3f4f6',
                                                        color: copiedField === 'email' ? 'white' : '#374151',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (copiedField !== 'email') {
                                                            e.target.style.backgroundColor = '#e5e7eb';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (copiedField !== 'email') {
                                                            e.target.style.backgroundColor = '#f3f4f6';
                                                        }
                                                    }}
                                                >
                                                    {copiedField === 'email' ? '✓ Copied' : 'Copy'}
                                                </button>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                gap: '8px',
                                                flexWrap: 'wrap'
                                            }}>
                                                <a
                                                    href={hoveredPerson.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '12px',
                                                        color: '#0a66c2',
                                                        textDecoration: 'none',
                                                        fontWeight: '500',
                                                        padding: '6px 10px',
                                                        backgroundColor: '#f0f7ff',
                                                        borderRadius: '4px',
                                                        transition: 'background-color 0.2s',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f0ff'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f7ff'}
                                                >
                                                    🔗 LinkedIn
                                                </a>

                                                <button
                                                    onClick={() => copyToClipboard(hoveredPerson.linkedin, 'linkedin')}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '12px',
                                                        color: copiedField === 'linkedin' ? 'white' : '#6b7280',
                                                        fontWeight: '500',
                                                        padding: '6px 10px',
                                                        backgroundColor: copiedField === 'linkedin' ? '#10b981' : '#f3f4f6',
                                                        borderRadius: '4px',
                                                        transition: 'all 0.2s',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (copiedField !== 'linkedin') {
                                                            e.target.style.backgroundColor = '#e5e7eb';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (copiedField !== 'linkedin') {
                                                            e.target.style.backgroundColor = '#f3f4f6';
                                                        }
                                                    }}
                                                >
                                                    {copiedField === 'linkedin' ? '✓ Copied' : '📋 Copy Link'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .filters {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .filter-group label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                }

                .filter-group select {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    background-color: white;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }

                .filter-group select:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .filter-group select:hover {
                    border-color: #9ca3af;
                }
            `}</style>
        </div>
    );
};

export default BuyingGroup;
