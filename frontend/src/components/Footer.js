import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      borderTop: '1px solid #1e293b',
      padding: '48px 24px 28px 24px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '36px',
        marginBottom: '36px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
            }}>A</div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
              Aura<span style={{ color: '#38bdf8' }}>Store</span>
            </span>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Store Departments</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', lineHeight: '2' }}>
            <li>⚡ Wireless Headphones & Earbuds</li>
            <li>⌚ AMOLED Smart Fitness Watches</li>
            <li>🎮 Precision Mechanical Keyboards</li>
            <li>🔌 Fast Chargers & Tech Essentials</li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        paddingTop: '24px',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b',
      }}>
        <div>© 2026 AuraStore Technologies. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;