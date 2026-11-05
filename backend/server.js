const dotenv = require('dotenv');

// Load environment variables before importing modules that read them.
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  // Do not accept API traffic until PostgreSQL and the schema are ready.
  await connectDB();

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`[AuraStore Server] Listening in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('[AuraStore Server] Startup failed:', error);
    process.exit(1);
  });
}

module.exports = app;
