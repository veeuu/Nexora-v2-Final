import React, { useState, useEffect } from 'react';
import { IndustryProvider } from '../context/IndustryContext';
import Header from './Header';
import Menu from './Menu';
import MartechSummary from './martech/Summary';
import MartechNTP from './martech/NTP';
import Martechintent from './martech/Intent';
import MartechTechnographics from './martech/Technographics';
import RenewalIntelligence from './martech/RenewalIntelligence';
import MartechBuyingGroup from './martech/BuyingGroup';
import MarketSummary from './market/Summary';
// import MarketNTP from './market/NTP'; // Commented out as requested
import MarketFinancial from './market/Financial';
import StockPerformance from './market/StockPerformance';
import BuyerGroup from './market/BuyerGroup';
import Growth from './market/Growth';
import MutualFund from './market/MutualFund'; // Added import for MutualFund

const Dashboard = ({ onLogout, onNavRef }) => {
  const [activeView, setActiveView] = useState('Martech');
  const [activeSection, setActiveSection] = useState('Summary');

  const handleDropdownChange = (value) => {
    setActiveView(value);
    setActiveSection('Summary');
  };

  const handleMenuClick = (section) => {
    setActiveSection(section);
  };

  const handleChatbotNavigation = (page) => {
    if (!page) return;
    
    const sectionMap = {
      'Intent': 'Intent',
      'Technographics': 'Technographics',
      'NTP': 'NTP®',
      'Buying Group': 'Buying Group',
      'Renewal Intelligence': 'Renewal Intelligence',
      'Summary': 'Summary',
      'Financial': 'Financial',
      'Stock Performance': 'Stock Performance',
      'Buyer Group': 'Buyer Group'
    };

    const view = ['Intent', 'Technographics', 'NTP', 'Buying Group', 'Renewal Intelligence'].includes(page.page) ? 'Martech' : 'Market';
    const section = sectionMap[page.page] || 'Summary';

    setActiveView(view);
    setActiveSection(section);
  };

  useEffect(() => {
    if (onNavRef) {
      onNavRef(handleChatbotNavigation);
    }
  }, [onNavRef]);

  const getMenuItems = () => {
    return activeView === 'Martech'
      ? ['Insights Panel', 'Technographics', 'Renewal Intelligence', 'Intent', 'Buying Group', 'NTP®']
      : ['Summary', /* 'NTP', */ 'Financial', 'Stock Performance', 'Buyer Group', 'Growth', 'Mutual Fund']; // Added 'Mutual Fund' to the menu
  };

  const renderActiveSection = () => {
    if (activeView === 'Martech') {
      switch (activeSection) {
        case 'Summary':
          return <MartechSummary />;
        case 'NTP':
        case 'NTP®':
          return <MartechNTP />;
        case 'Intent':
          return <Martechintent />;
        case 'Technographics':
          return <MartechTechnographics />;
        case 'Renewal Intelligence':
          return <RenewalIntelligence />;
        case 'Buying Group':
          return <MartechBuyingGroup />;
        default:
          return <MartechSummary />;
      }
    } else {
      switch (activeSection) {
        case 'Summary':
          return <MarketSummary />;
        // case 'NTP':
        //   return <MarketNTP />; // Commented out
        case 'Financial':
          return <MarketFinancial />;
        case 'Stock Performance':
          return <StockPerformance />;
        case 'Buyer Group':
          return <BuyerGroup />;
        case 'Growth':
          return <Growth />;
        case 'Mutual Fund':
          return <MutualFund />;
        default:
          return <MarketSummary />;
      }
    }
  };

  return (
    <IndustryProvider>
      <div className="dashboard">
        <Header onDropdownChange={handleDropdownChange} />
        <div className="dashboard-content">
          <Menu
            activeSection={activeSection}
            onMenuClick={handleMenuClick}
            menuItems={getMenuItems()}
            onLogout={onLogout}
          />
          <main className="main-content">
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </IndustryProvider>
  );
};

export default Dashboard;