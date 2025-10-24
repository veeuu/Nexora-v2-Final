// src/App.jsx
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './styles.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => setIsAuthenticated(false);

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={setIsAuthenticated} />
      )}
    </div>
  );
}

export default App;