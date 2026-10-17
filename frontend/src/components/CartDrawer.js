import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

const CartDrawer = ({ onCheckoutSuccess }) => {
  const {
    cartItems,
    isDrawerOpen,
    setIsDrawerOpen,
    removeFromCart,
    clearCart,
    itemsSubtotal,
    shippingFee,
    taxPrice,
    totalPrice,
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  if (!isDrawerOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      alert('Please select Customer or Administrator role to complete checkout!');
      return;
    }
    if (cartItems.length === 0) {
      alert('Cart is empty.');
      return;
    }

    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          qty: item.qty,
        })),
        shippingAddress: {
          address: '742 Evergreen Terrace',
          city: 'Springfield',
          postalCode: '97477',
          country: 'United States',
        },
        paymentMethod: 'Credit Card',
      };

      const { data } = await API.post('/orders', orderPayload);
      clearCart();
      setIsDrawerOpen(false);
      if (onCheckoutSuccess) {
        onCheckoutSuccess(data);
      }
      alert(`Order Confirmed! Receipt ID: ${data._id}`);
    } catch (err) {
      alert(`Checkout failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(3px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        height: '100%',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Your Cart ({cartItems.length})</h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              Your shopping cart is currently empty.
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Qty: {item.qty} × ₹{item.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Subtotal & 8% Tax Financial Breakdown */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px 24px',
          borderTop: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#64748b' }}>Items Subtotal:</span>
            <span style={{ fontWeight: '600' }}>₹{itemsSubtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#64748b' }}>Shipping Fee:</span>
            <span style={{ fontWeight: '600' }}>
              {shippingFee === 0 ? 'FREE (Over $100)' : `₹${shippingFee.toFixed(2)}`}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
            <span style={{ color: '#64748b' }}>Estimated Tax (8%):</span>
            <span style={{ fontWeight: '600' }}>₹{taxPrice.toFixed(2)}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '16px',
            fontWeight: '800',
            color: '#0f172a',
            paddingTop: '10px',
            borderTop: '1px solid #e2e8f0',
            marginBottom: '16px',
          }}>
            <span>Final Total:</span>
            <span style={{ color: '#0284c7' }}>₹{totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            style={{
              width: '100%',
              backgroundColor: cartItems.length === 0 ? '#94a3b8' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
            }}
          >
            Execute Verified Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
