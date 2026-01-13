// src/App.jsx
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ChatBot from './components/ChatBot';
import './styles.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardNav, setDashboardNav] = useState(null);

  const handleLogout = () => setIsAuthenticated(false);

  const handleChatbotNavigate = (page) => {
    if (dashboardNav) {
      dashboardNav(page);
    }
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} onNavRef={setDashboardNav} />
      ) : (
        <Login onLogin={setIsAuthenticated} />
      )}
      <ChatBot isAuthenticated={isAuthenticated} onNavigate={handleChatbotNavigate} />
    </div>
  );
}

export default App;