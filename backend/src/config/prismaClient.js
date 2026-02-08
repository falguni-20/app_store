require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { AsyncLocalStorage } = require('async_hooks');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '*****' : 'Not set');

let prisma;
try {
  prisma = new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  process.exit(1);
}

const asyncLocalStorage = new AsyncLocalStorage();

function runWithTenant(tenantId, organizationId, callback) {
  return asyncLocalStorage.run({ tenantId, organizationId }, callback);
}


module.exports = { prisma, runWithTenant, asyncLocalStorage };