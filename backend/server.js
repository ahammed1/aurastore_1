const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const healthRoutes = require('./routes/healthRoutes');

dotenv.config();

// Prevent server process termination from unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[AuraStore Server] Unhandled Promise Rejection caught:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[AuraStore Server] Uncaught Exception caught:', err);
});

// Connect Database
connectDB();

const app = express();

// Express Gateway Middleware: CORS, Morgan, JSON parser
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// REST API Gateway Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Error Boundary Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[AuraStore Server] Listening in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
});

module.exports = app;