import React, { useState, useEffect } from 'react';
import API from '../api';


const AdminScreen = () => {
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newSKU, setNewSKU] = useState({
    name: '',
    brand: '',
    category: 'Electronics',
    price: '',
    countInStock: '',
    description: '',
  });
  

  // Fetch live SKUs from PostgreSQL database
  const loadLiveSKUs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/products?limit=100');
      if (data && Array.isArray(data.products)) {
        setSkus(data.products);
      }
    } catch (err) {
      console.error('Failed to load SKUs from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveSKUs();
  }, []);

  // Publish new SKU directly to PostgreSQL database
  const handleCreateSKU = async (e) => {
    e.preventDefault();
    if (!newSKU.name || !newSKU.price) {
      alert('Please provide product name and price');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: newSKU.name,
        brand: newSKU.brand || 'AuraBrand',
        category: newSKU.category,
        price: parseFloat(newSKU.price),
        countInStock: parseInt(newSKU.countInStock) || 0,
        description: newSKU.description || 'Enterprise-grade curated product.',
        image: '/images/sample.jpg',
      };

      const { data } = await API.post('/products', payload);
      setSkus((prev) => [data, ...prev]);
      setNewSKU({ name: '', brand: '', category: 'Electronics', price: '', countInStock: '', description: '' });
      alert(`Success! "${data.name}" has been published to PostgreSQL and is now live on the customer store.`);
    } catch (err) {
      alert(`Failed to publish product: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Adjust stock count directly in PostgreSQL
  const handleUpdateStock = async (id, delta) => {
    const current = skus.find((item) => (item._id || item.id) === id);
    if (!current) return;
    const updatedCount = Math.max(0, current.countInStock + delta);

    try {
      const { data } = await API.put(`/products/${id}`, {
        countInStock: updatedCount,
      });

      setSkus((prev) =>
        prev.map((item) => ((item._id || item.id) === id ? { ...item, countInStock: data.countInStock } : item))
      );
    } catch (err) {
      alert(`Failed to update stock in database: ${err.response?.data?.message || err.message}`);
    }
  };

  // Remove SKU from PostgreSQL
  const handleDeleteSKU = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the store catalog?`)) {
      return;
    }

    try {
      await API.delete(`/products/${id}`);
      setSkus((prev) => prev.filter((item) => (item._id || item.id) !== id));
      alert(`Product "${name}" deleted from database.`);
    } catch (err) {
      alert(`Failed to delete product: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
          Administrator SKU Catalog & Inventory Management
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Publish new products directly to the PostgreSQL database or manage live inventory stock levels.
        </p>
      </div>

      {/* Publish Form */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '36px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: '#0f172a' }}>
          Publish New Product SKU to Store
        </h3>

        <form onSubmit={handleCreateSKU}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                Product Name *
              </label>
              <input
                type="text"
                placeholder=""
                value={newSKU.name}
                onChange={(e) => setNewSKU({ ...newSKU, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                Brand
              </label>
              <input
                type="text"
                placeholder=""
                value={newSKU.brand}
                onChange={(e) => setNewSKU({ ...newSKU, brand: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                Category
              </label>
              <select
                value={newSKU.category}
                onChange={(e) => setNewSKU({ ...newSKU, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Electronics">Electronics</option>
                <option value="Wearables">Wearables</option>
                <option value="Accessories">Accessories</option>
                <option value="Gaming">Gaming</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="199.99"
                value={newSKU.price}
                onChange={(e) => setNewSKU({ ...newSKU, price: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                Initial Stock
              </label>
              <input
                type="number"
                placeholder="25"
                value={newSKU.countInStock}
                onChange={(e) => setNewSKU({ ...newSKU, countInStock: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
              Description
            </label>
            <input
              type="text"
              placeholder="Detailed product highlights and features..."
              value={newSKU.description}
              onChange={(e) => setNewSKU({ ...newSKU, description: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Saving to Database...' : '+ Publish SKU to Store'}
          </button>
        </form>
      </div>

      {/* SKUs Inventory Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
            Live Products in PostgreSQL ({skus.length})
          </h3>
          <button
            onClick={loadLiveSKUs}
            style={{
              background: 'none',
              border: '1px solid #cbd5e1',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            Loading live SKUs from PostgreSQL...
          </div>
        ) : skus.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No products found in the database. Use the form above to publish your first SKU.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>SKU ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Price</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Live Inventory</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Stock Adjust</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {skus.map((sku) => {
                  const skuId = sku._id || sku.id;
                  return (
                    <tr key={skuId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>
                        {skuId}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                        {sku.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {sku.category}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                        ₹{Number(sku.price).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontWeight: '700',
                          fontSize: '12px',
                          backgroundColor: sku.countInStock > 0 ? '#dcfce7' : '#fee2e2',
                          color: sku.countInStock > 0 ? '#15803d' : '#991b1b',
                        }}>
                          {sku.countInStock} units
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleUpdateStock(skuId, 5)}
                            style={{
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            +5 Stock
                          </button>
                          <button
                            disabled={sku.countInStock <= 0}
                            onClick={() => handleUpdateStock(skuId, -1)}
                            style={{
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: sku.countInStock > 0 ? 'pointer' : 'not-allowed',
                            }}
                          >
                            -1 Stock
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleDeleteSKU(skuId, sku.name)}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScreen;
