import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'customer_login', onSuccess }) => {
  const { login, register } = useContext(AuthContext);
  const [mode, setMode] = useState(initialMode); // 'customer_login', 'customer_register', 'admin_login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (mode === 'customer_register') {
        if (!name || !email || !password) {
          setErrorMsg('Please fill in all registration fields');
          setSubmitting(false);
          return;
        }
        await register(name, email, password);
        alert(`Account created successfully! Welcome, ${name}`);
        onClose();
        if (onSuccess) onSuccess('customer');
      } else if (mode === 'admin_login') {
        if (!email || !password) {
          setErrorMsg('Please provide admin email and password');
          setSubmitting(false);
          return;
        }
        const data = await login(email, password);
        if (data.role !== 'admin') {
          setErrorMsg('Access denied: This account does not possess administrator privileges.');
          setSubmitting(false);
          return;
        }
        alert(`Administrator logged in successfully. Welcome, ${data.name}!`);
        onClose();
        if (onSuccess) onSuccess('admin');
      } else {
        // Customer login
        if (!email || !password) {
          setErrorMsg('Please provide email and password');
          setSubmitting(false);
          return;
        }
        const data = await login(email, password);
        alert(`Logged in successfully. Welcome back, ${data.name}!`);
        onClose();
        if (onSuccess) onSuccess('customer');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdminTab = mode === 'admin_login';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          backgroundColor: isAdminTab ? '#0f172a' : '#0284c7',
          padding: '20px 24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
              {isAdminTab ? 'Administrator Portal Access' : (mode === 'customer_register' ? 'Create Customer Account' : 'Customer Sign In')}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>
              {isAdminTab ? 'Authorized store management portal' : 'Access your cart, order receipts & tracking'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}>
          <button
            type="button"
            onClick={() => { setMode('customer_login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: mode === 'customer_login' ? '#ffffff' : 'transparent',
              fontWeight: mode === 'customer_login' ? '700' : '500',
              color: mode === 'customer_login' ? '#0284c7' : '#64748b',
              borderBottom: mode === 'customer_login' ? '2px solid #0284c7' : 'none',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('customer_register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: mode === 'customer_register' ? '#ffffff' : 'transparent',
              fontWeight: mode === 'customer_register' ? '700' : '500',
              color: mode === 'customer_register' ? '#0284c7' : '#64748b',
              borderBottom: mode === 'customer_register' ? '2px solid #0284c7' : 'none',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin_login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: mode === 'admin_login' ? '#ffffff' : 'transparent',
              fontWeight: mode === 'admin_login' ? '700' : '500',
              color: mode === 'admin_login' ? '#0f172a' : '#64748b',
              borderBottom: mode === 'admin_login' ? '2px solid #0f172a' : 'none',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Admin Portal
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {errorMsg}
            </div>
          )}

          {mode === 'customer_register' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              {isAdminTab ? 'Admin Email' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAdminTab ? 'admin@aurastore.com' : 'you@example.com'}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              backgroundColor: isAdminTab ? '#0f172a' : '#0284c7',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'background-color 0.2s',
            }}
          >
            {submitting ? 'Authenticating...' : (isAdminTab ? 'Sign In to Admin Console' : (mode === 'customer_register' ? 'Complete Registration' : 'Sign In as Customer'))}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
