import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('auraCart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('auraCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Synchronize with backend when user is logged in
  useEffect(() => {
    if (user && user.token) {
      API.get('/cart')
        .then(({ data }) => {
          if (data && data.items && data.items.length > 0) {
            setCartItems(data.items);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Add or update item with live stock boundary checks
  const addToCart = async (product, qty = 1) => {
    const requestedQty = Number(qty) > 0 ? Number(qty) : 1;
    const existing = cartItems.find((x) => x.product === (product._id || product.id || product.product));

    const liveMaxStock = product.countInStock !== undefined ? product.countInStock : 999;
    const finalQty = Math.min(requestedQty, liveMaxStock);

    if (finalQty <= 0) return;

    let updated;
    const prodId = product._id || product.id || product.product;
    if (existing) {
      updated = cartItems.map((x) =>
        (x.product === prodId)
          ? { ...x, qty: Math.min(x.qty + finalQty, liveMaxStock) }
          : x
      );
    } else {
      updated = [
        ...cartItems,
        {
          product: prodId,
          name: product.name,
          image: product.image,
          price: product.price,
          countInStock: product.countInStock,
          qty: finalQty,
        },
      ];
    }
    setCartItems(updated);

    // Sync to backend if logged in
    if (user && user.token) {
      try {
        await API.post('/cart', {
          productId: prodId,
          qty: finalQty,
        });
      } catch (err) {
        console.warn('Backend cart sync error:', err.message);
      }
    }

    setIsDrawerOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((x) => x.product !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('auraCart');
  };

  // Instantaneous Financial Breakdown
  const itemsSubtotal = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  );
  const shippingFee = itemsSubtotal > 100 || itemsSubtotal === 0 ? 0.0 : 10.0;
  const taxPrice = Number((itemsSubtotal * 0.08).toFixed(2)); // Exact 8% Tax
  const totalPrice = Number((itemsSubtotal + shippingFee + taxPrice).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        removeFromCart,
        clearCart,
        itemsSubtotal,
        shippingFee,
        taxPrice,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
