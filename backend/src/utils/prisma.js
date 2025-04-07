const { PrismaClient } = require('@prisma/client');

// Instantiate Prisma client with error logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
});

module.exports = prisma; 