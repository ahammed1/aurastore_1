import React, { useState, useContext } from 'react';
import Rating from '../components/Rating';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const ProductScreen = ({ product, onBack }) => {
  const [qty, setQty] = useState(1);
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState(product.reviews || []);

  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newRev = {
      _id: `rev_${Date.now()}`,
      name: user ? user.name : 'Verified Customer',
      rating: Number(userRating),
      comment,
      createdAt: new Date().toISOString(),
    };

    setReviews([newRev, ...reviews]);
    setComment('');
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 24px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#0284c7',
          fontWeight: '600',
          fontSize: '14px',
          marginBottom: '20px',
        }}
      >
        &larr; Back to Catalog
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '32px',
      }}>
        {/* Product Visual Showcase */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          height: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #cbd5e1',
        }}>
          <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' }}>
            [SKU Media: {product.name}]
          </span>
        </div>

        {/* Product Details & Actions */}
        <div>
          <span style={{
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#0284c7',
            backgroundColor: '#e0f2fe',
            padding: '3px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
          }}>
            {product.category}
          </span>

          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: '#0f172a' }}>
            {product.name}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
            Brand: <strong>{product.brand}</strong>
          </p>

          <Rating value={product.rating} text={`${product.numReviews} ratings`} />

          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '16px 0' }}>
            ₹{product.price.toFixed(2)}
          </div>

          <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>
            {product.description}
          </p>

          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Availability:</span>
              <span style={{
                fontSize: '13px',
                fontWeight: '700',
                color: product.countInStock > 0 ? '#10b981' : '#ef4444',
              }}>
                {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : 'Unavailable'}
              </span>
            </div>

            {product.countInStock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Select Quantity:</span>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product, qty)}
            disabled={product.countInStock === 0}
            style={{
              width: '100%',
              backgroundColor: product.countInStock > 0 ? '#0284c7' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '15px',
            }}
          >
            Add To Cart &bull; ₹{(product.price * qty).toFixed(2)}
          </button>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div style={{
        marginTop: '32px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '32px',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Verified Customer Reviews</h3>

        {/* Submit Review */}
        <form onSubmit={handleReviewSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Rating:</span>
            <select
              value={userRating}
              onChange={(e) => setUserRating(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your verified customer experience..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              minHeight: '70px',
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: '8px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            Post Review
          </button>
        </form>

        {/* Existing Reviews List */}
        {reviews.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>No customer reviews yet.</p>
        ) : (
          reviews.map((r, i) => (
            <div key={i} style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.name}</span>
                <Rating value={r.rating} />
              </div>
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductScreen;
