import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0b1329',
      color: '#94a3b8',
      borderTop: '1px solid #1e293b',
      padding: '40px 32px 24px 32px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '32px',
        paddingBottom: '36px',
      }}>
        {/* Brand Section on the Far Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '18px',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
          }}>
            A
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
            Aura<span style={{ color: '#38bdf8' }}>Store</span>
          </span>
        </div>

        {/* Store Departments Section on the Far Right End */}
        <div style={{ textAlign: 'left' }}>
          <h4 style={{
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '700',
            marginTop: 0,
            marginBottom: '14px',
            letterSpacing: '-0.2px',
          }}>
            Store Departments
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '13px',
            lineHeight: '2.1',
            color: '#94a3b8',
          }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> Wireless Headphones & Earbuds
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⌚</span> AMOLED Smart Fitness Watches
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎮</span> Precision Mechanical Keyboards
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔌</span> Fast Chargers & Tech Essentials
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Line */}
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '12px',
        color: '#64748b',
      }}>
        © 2026 AuraStore Technologies. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;