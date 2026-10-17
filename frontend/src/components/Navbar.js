import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import AuthModal from './AuthModal';

const Navbar = ({ activeScreen, setActiveScreen, searchQuery, setSearchQuery }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems, setIsDrawerOpen } = useContext(CartContext);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('customer_login');

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const openAuth = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (role) => {
    if (role === 'admin') {
      setActiveScreen('admin');
    } else {
      setActiveScreen('home');
    }
  };

  return (
    <>
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}>
          {/* Brand */}
          <div
            onClick={() => setActiveScreen('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '20px',
            }}>A</div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                Aura<span style={{ color: '#0284c7' }}>Store</span>
              </span>
              <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                PERN Edition
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: '1', maxWidth: '440px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headphones, wearables, brand..."
              style={{
                width: '100%',
                padding: '9px 16px 9px 38px',
                borderRadius: '24px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '13px',
                backgroundColor: '#f8fafc',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Nav Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setActiveScreen('home')}
              style={{
                background: activeScreen === 'home' ? '#f0f9ff' : 'none',
                border: activeScreen === 'home' ? '1px solid #bae6fd' : 'none',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: activeScreen === 'home' ? '700' : '600',
                color: activeScreen === 'home' ? '#0284c7' : '#475569',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Catalog
            </button>

            {user && user.role !== 'admin' && (
              <button
                onClick={() => setActiveScreen('orders')}
                style={{
                  background: activeScreen === 'orders' ? '#f0f9ff' : 'none',
                  border: activeScreen === 'orders' ? '1px solid #bae6fd' : 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: activeScreen === 'orders' ? '700' : '600',
                  color: activeScreen === 'orders' ? '#0284c7' : '#475569',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                My Orders
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveScreen('admin')}
                style={{
                  background: activeScreen === 'admin'
                    ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                    : '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>⚡</span> Admin SKU Portal
              </button>
            )}

            {!user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => openAuth('customer_login')}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    color: '#334155',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('admin_login')}
                  style={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    color: '#ffffff',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Admin Portal
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '12px' }}>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{user.name}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color: user.role === 'admin' ? '#ef4444' : '#0284c7',
                  }}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    color: '#991b1b',
                    fontWeight: '700',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            )}

            <button
              onClick={() => setIsDrawerOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <span>🛒</span> Cart
              {totalCartCount > 0 && (
                <span style={{
                  backgroundColor: '#ffffff',
                  color: '#0284c7',
                  borderRadius: '50%',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: '800',
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;