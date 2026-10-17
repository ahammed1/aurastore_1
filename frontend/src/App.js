import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import OrdersScreen from './screens/OrdersScreen';
import AdminScreen from './screens/AdminScreen';

function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navigateToProduct = (product) => {
    setSelectedProduct(product);
    setActiveScreen('product');
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <main style={{ flex: 1 }}>
            {activeScreen === 'home' && (
              <HomeScreen
                onSelectProduct={navigateToProduct}
                searchQuery={searchQuery}
              />
            )}
            {activeScreen === 'product' && selectedProduct && (
              <ProductScreen
                product={selectedProduct}
                onBack={() => setActiveScreen('home')}
              />
            )}
            {activeScreen === 'orders' && <OrdersScreen />}
            {activeScreen === 'admin' && <AdminScreen />}
          </main>

          <CartDrawer onCheckoutSuccess={() => setActiveScreen('orders')} />
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
