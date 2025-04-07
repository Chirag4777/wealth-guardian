/**
 * Application configuration
 * Uses environment variables with fallbacks for development
 */

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'wealthguardian_dev_secret',
    jwtExpire: process.env.JWT_EXPIRE || '30d',
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/wealthguardian',
  },
  
  // Razorpay configuration
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_UdVjVwRqNtjmU7',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'mP14sROQFJnTxgDdW4UKlQ1B',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'wealthguardian_webhook_secret',
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || 'test@example.com',
    password: process.env.EMAIL_PASSWORD || 'password',
    from: process.env.EMAIL_FROM || 'noreply@wealthguardian.com',
  },
  
  // Frontend URL for redirects
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

module.exports = config; 