import React, { useState, useEffect, useContext } from 'react';
import Rating from '../components/Rating';
import { CartContext } from '../context/CartContext';
import API from '../api';

const INITIAL_DEMO_PRODUCTS = [
  {
    _id: 'prod_001',
    name: 'Aura Wireless Noise-Cancelling Headphones',
    brand: 'AuraAudio',
    category: 'Electronics',
    price: 14999.00,
    countInStock: 25,
    rating: 4.8,
    numReviews: 14,
    description: 'High-performance over-ear wireless headphones with active noise cancellation and 40h battery life.',
  },
  {
    _id: 'prod_002',
    name: 'Aura Smart Fitness Watch',
    brand: 'AuraTech',
    category: 'Wearables',
    price: 4999.00,
    countInStock: 40,
    rating: 4.5,
    numReviews: 9,
    description: 'AMOLED display fitness tracker with continuous heart-rate, SpO2, and deep sleep monitoring.',
  },
  {
    _id: 'prod_003',
    name: 'Aura Studio Wireless Earbuds',
    brand: 'AuraAudio',
    category: 'Electronics',
    price: 2999.00,
    countInStock: 50,
    rating: 4.2,
    numReviews: 6,
    description: 'Compact true-wireless earbuds with dual ENC microphones and fast wireless charging case.',
  },
];

const categoryIcons = {
  All: '✨',
  Electronics: '⚡',
  Wearables: '⌚',
  Gaming: '🎮',
  Accessories: '🔌',
};

const categoryGradients = {
  Electronics: 'linear-gradient(135deg, #1e293b 0%, #0369a1 100%)',
  Wearables: 'linear-gradient(135deg, #0f172a 0%, #4338ca 100%)',
  Gaming: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
  Accessories: 'linear-gradient(135deg, #0f172a 0%, #047857 100%)',
  Default: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
};

const HomeScreen = ({ onSelectProduct, searchQuery }) => {
  const [products, setProducts] = useState(INITIAL_DEMO_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('featured');
  const [loading, setLoading] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/products?limit=100');
        if (isMounted && data && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch (err) {
        console.warn('Backend products not loaded, displaying initial store catalog', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  const dynamicCategories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  let filtered = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortOption === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '64px' }}>
      {/* Hero Banner */}
      {!searchQuery && (
        <section style={{
          background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '60px 24px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #334155',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 16px',
              borderRadius: '24px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#38bdf8',
              marginBottom: '20px',
            }}>
              <span>🚀</span> AuraStore • Powered by PostgreSQL
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: '800',
              letterSpacing: '-1px',
              lineHeight: '1.15',
              margin: '0 auto 16px auto',
              maxWidth: '800px',
              color: '#ffffff',
            }}>
              Next-Gen Audio, Wearables & Gaming Gear
            </h1>

            <p style={{
              fontSize: 'clamp(14px, 2vw, 17px)',
              color: '#94a3b8',
              maxWidth: '620px',
              margin: '0 auto 28px auto',
              lineHeight: '1.6',
            }}>
              Engineered with studio-grade acoustics and precision endurance. Backed by live PostgreSQL stock synchronization.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: '#cbd5e1',
            }}>
              <span><strong style={{ color: '#10b981' }}>✔</strong> Free Express Delivery across India</span>
              <span><strong style={{ color: '#10b981' }}>✔</strong> 2-Year Replacement Warranty</span>
              <span><strong style={{ color: '#10b981' }}>✔</strong> Real-Time Stock Management</span>
            </div>
          </div>
        </section>
      )}

      

      {/* Product Catalog */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        {/* Controls Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '14px 20px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {dynamicCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: isActive ? '#0284c7' : '#e2e8f0',
                    background: isActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{categoryIcons[cat] || '🏷️'}</span>
                  {cat}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="featured">⭐ Featured</option>
              <option value="price_asc">₹ Price: Low to High</option>
              <option value="price_desc">₹ Price: High to Low</option>
              <option value="rating">★ Highest Rating</option>
            </select>
          </div>
        </div>

        {/* Product Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '24px',
        }}>
          {filtered.map((product) => {
            const bgGradient = categoryGradients[product.category] || categoryGradients.Default;
            const inStock = product.countInStock > 0;

            return (
              <div
                key={product._id || product.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  onClick={() => onSelectProduct && onSelectProduct(product)}
                  style={{
                    height: '190px',
                    background: bgGradient,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                    }}>
                      {product.category}
                    </span>

                    <span style={{
                      backgroundColor: inStock ? '#10b981' : '#ef4444',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '12px',
                    }}>
                      ● {inStock ? `${product.countInStock} Left` : 'Sold Out'}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '42px' }}>
                      {product.category === 'Wearables' ? '⌚' : product.category === 'Gaming' ? '🎮' : '🎧'}
                    </div>
                    <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '13px', opacity: 0.9 }}>
                      {product.brand?.toUpperCase()}
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
                    SKU: {product._id || product.id}
                  </div>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4
                    onClick={() => onSelectProduct && onSelectProduct(product)}
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#0f172a',
                      cursor: 'pointer',
                      lineHeight: '1.35',
                      minHeight: '44px',
                    }}
                  >
                    {product.name}
                  </h4>

                  <div style={{ marginBottom: '12px' }}>
                    <Rating value={product.rating || 0} text={`${product.numReviews || 0} reviews`} />
                  </div>

                  <p style={{
                    margin: '0 0 16px 0',
                    fontSize: '13px',
                    color: '#64748b',
                    lineHeight: '1.5',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {product.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9',
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Price</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
                        ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <button
                      disabled={!inStock}
                      onClick={() => addToCart(product)}
                      style={{
                        background: inStock
                          ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                          : '#cbd5e1',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: inStock ? 'pointer' : 'not-allowed',
                      }}
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;