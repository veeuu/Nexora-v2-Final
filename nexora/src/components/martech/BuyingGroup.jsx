import { useState } from 'react';

const BuyingGroup = () => {
    // Sample data with company names and their corresponding Google Drive image links
    const companyData = [
        {
            id: 1,
            name: '10XDS',
            imageUrl: 'https://drive.google.com/thumbnail?id=1luyAB1Hkm8Y0JRyoM4XBqcuTcuJ-tgFJ&sz=w5000'
        },
        {
            id: 2,
            name: '2Base Technologies Pvt. Ltd',
            imageUrl: 'https://drive.google.com/thumbnail?id=14tgOllVJPW5blie7DioSJUqzIkzs8oX1&sz=w5000'
        },
        {
            id: 3,
            name: '3I Infotech Consultancy Ltd',
            imageUrl: 'https://drive.google.com/thumbnail?id=18-XnqqEwI0V3S_YikfIUhOnAtiUeeg7z&sz=w5000'
        },
        // {
        //     id: 4,
        //     name: '4DCompass InfoSolutions Private Limited',
        //     imageUrl: 'https://drive.google.com/thumbnail?id=1qACb8oZR5nbI7Iv3K4o-pVKA4fvMqBq7&sz=w5000'
        // },
        {
            id: 5,
            name: '88 Pictures',
            imageUrl: 'https://drive.google.com/thumbnail?id=1DfkyWntcCOdmm8_2uhqlZXbEIswRDoj8&sz=w5000'
        },
    ];

    const [selectedCompany, setSelectedCompany] = useState(companyData[0].id);
    const [imageError, setImageError] = useState(false);

    const currentCompany = companyData.find(company => company.id === selectedCompany);

    const handleCompanyChange = (e) => {
        setSelectedCompany(parseInt(e.target.value));
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
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
                minHeight: '500px'
            }}>
                {currentCompany && (
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {imageError ? (
                            <p style={{ color: '#9ca3af', fontSize: '16px' }}>Image not available</p>
                        ) : (
                            <img
                                src={currentCompany.imageUrl}
                                alt={currentCompany.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '600px',
                                    objectFit: 'contain',
                                    borderRadius: '6px'
                                }}
                                onError={handleImageError}
                            />
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
