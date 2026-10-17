import React from 'react';

const Rating = ({ value = 0, text = '', color = '#f59e0b' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
      <div style={{ color, letterSpacing: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {value >= star ? '★' : value >= star - 0.5 ? '★' : '☆'}
          </span>
        ))}
      </div>
      {text && <span style={{ color: '#64748b', marginLeft: '4px' }}>({text})</span>}
    </div>
  );
};

export default Rating;
