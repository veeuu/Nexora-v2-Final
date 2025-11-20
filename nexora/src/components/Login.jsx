import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'Nexora' && password === 'Proplus@2025') {
      onLogin(true);
    } else {
      alert('Incorrect username or password');
    }
  };

  return (
    <div
      className="login-page"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f0f2f5',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: 8,
          boxShadow: '0 6px 20px rgba(27,39,94,0.08)',
          width: '300px',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Sign in to Nexora</h2>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '0.6rem 1rem',
            background: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            width: '100%',
          }}
        >
          Sign in
        </button>
      </form>
    </div>
  );
};

export default Login;
