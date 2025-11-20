import React, { useState } from 'react';

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
        {
            id: 4,
            name: '4DCompass InfoSolutions Private Limited',
            imageUrl: 'https://drive.google.com/thumbnail?id=1qACb8oZR5nbI7Iv3K4o-pVKA4fvMqBq7&sz=w5000'
        },
        {
            id: 5,
            name: '88 Pictures',
            imageUrl: 'https://drive.google.com/thumbnail?id=1DfkyWntcCOdmm8_2uhqlZXbEIswRDoj8&sz=w5000'
        },
    ];

    const [selectedCompany, setSelectedCompany] = useState(companyData[0].id);

    const currentCompany = companyData.find(company => company.id === selectedCompany);

    const handleCompanyChange = (e) => {
        setSelectedCompany(parseInt(e.target.value));
    };

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
                Buying Group
            </h1>

            {/* Filter Section */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                marginBottom: '20px',
                border: '1px solid #e5e7eb'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '15px' }}>
                    Filters
                </h2>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
                    {/* Company Name Dropdown */}
                    <div style={{ flex: 1, maxWidth: '300px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '8px'
                        }}>
                            Select Company
                        </label>
                        <select
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                            {companyData.map(company => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>
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
                        <img
                            src={currentCompany.imageUrl}
                            alt={currentCompany.name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '600px',
                                objectFit: 'contain',
                                borderRadius: '6px'
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<p style="color: #9ca3af; fontSize: 16px;">Image not available</p>';
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyingGroup;
