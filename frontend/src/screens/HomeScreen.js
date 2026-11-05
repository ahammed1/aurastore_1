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
  All: '⚡',
  Electronics: '🎧',
  Wearables: '⌚',
  Gaming: '🎮',
  Accessories: '🔌',
};

const HomeScreen = ({ onSelectProduct, searchQuery }) => {
  const [products, setProducts] = useState(INITIAL_DEMO_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('featured');
  const [loading, setLoading] = useState(false);
  const { addToCart } = useContext(CartContext);
  
  // Instant visual feedback states
  const [addedProduct, setAddedProduct] = useState(null);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedProduct({ id: product._id || product.id, name: product.name });
    setTimeout(() => {
      setAddedProduct(null);
    }, 2500);
  };

  // Fetch live products from PostgreSQL backend
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

  // Compute dynamic unique categories
  const dynamicCategories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  // Filtering & Sorting Pipeline
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
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Hero Banner */}
      {!searchQuery && (
        <section style={{
          background: 'radial-gradient(ellipse at 50% 0%, #0369a1 0%, #0f172a 75%)',
          color: '#ffffff',
          padding: '60px 24px 70px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
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
              backdropFilter: 'blur(8px)',
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

            {/* Badges Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: '#cbd5e1',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✔</span> Express Delivery across India
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✔</span> 2-Year Replacement Warranty
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✔</span> Real-Time Stock Management
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div style={{ maxWidth: '1240px', margin: '40px auto 0 auto', padding: '0 20px' }}>
        {/* Category Filter Pills & Sort Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {/* Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {dynamicCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    backgroundColor: isSelected ? '#0284c7' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    padding: '8px 18px',
                    borderRadius: '24px',
                    fontSize: '13px',
                    fontWeight: isSelected ? '700' : '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSelected ? '0 4px 10px rgba(2, 132, 199, 0.25)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{categoryIcons[cat] || '🏷️'}</span>
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="featured">Featured Catalog</option>
              <option value="price_asc">Price: Low to High (₹)</option>
              <option value="price_desc">Price: High to Low (₹)</option>
              <option value="rating">Top Customer Ratings</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Synchronizing Catalog with PostgreSQL...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>No matching products found</h3>
            <p>Try clearing your search query or switching categories.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {filtered.map((product) => {
              const inStock = product.countInStock > 0;
              const isAdded = addedProduct && addedProduct.id === (product._id || product.id);

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
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  {/* Image Header */}
                  <div
                    onClick={() => onSelectProduct && onSelectProduct(product)}
                    style={{
                      height: '200px',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <div style={{ fontSize: '56px' }}>
                      {product.category === 'Wearables' ? '⌚' : product.category === 'Gaming' ? '🎮' : '🎧'}
                    </div>

                    {/* Stock Status Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: inStock ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backdropFilter: 'blur(4px)',
                    }}>
                      {inStock ? `In Stock (${product.countInStock})` : 'Out of Stock'}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {product.brand} &bull; {product.category}
                    </div>

                    <h3
                      onClick={() => onSelectProduct && onSelectProduct(product)}
                      style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#0f172a',
                        margin: '0 0 8px 0',
                        cursor: 'pointer',
                        lineHeight: '1.3',
                      }}
                    >
                      {product.name}
                    </h3>

                    <p style={{
                      fontSize: '12px',
                      color: '#64748b',
                      lineHeight: '1.5',
                      margin: '0 0 14px 0',
                      flex: 1,
                    }}>
                      {product.description}
                    </p>

                    <div style={{ marginBottom: '16px' }}>
                      <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                    </div>

                    {/* Price & Action Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '16px',
                      borderTop: '1px solid #f1f5f9',
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Price</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                          ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <button
                        disabled={!inStock}
                        onClick={() => handleAddToCart(product)}
                        style={{
                          background: !inStock
                            ? '#cbd5e1'
                            : isAdded
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: inStock ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: inStock ? (isAdded ? '0 4px 12px rgba(16, 185, 129, 0.4)' : '0 4px 10px rgba(2, 132, 199, 0.3)') : 'none',
                          transition: 'all 0.25s ease',
                          transform: isAdded ? 'scale(1.04)' : 'scale(1)',
                        }}
                      >
                        {isAdded ? (
                          <>
                            <span style={{ fontSize: '15px' }}>✔</span> Added!
                          </>
                        ) : (
                          <>
                            <span>🛒</span> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instant Floating Toast Notification */}
      {addedProduct && (
        <div style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
        }}>
          <span style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '800',
          }}>✔</span>
          <span>Added <strong>"{addedProduct.name}"</strong> to your cart!</span>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;