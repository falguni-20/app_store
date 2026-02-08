require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { AsyncLocalStorage } = require('async_hooks');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '*****' : 'Not set'); // Log only if it exists, but mask the actual value for security

let prisma;
try {
  prisma = new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'], // Enable logging for debugging
  });
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  process.exit(1); // Exit the process to indicate a critical startup failure
}

const asyncLocalStorage = new AsyncLocalStorage();

// Middleware to run operations within a tenant context
function runWithTenant(tenantId, organizationId, callback) {
  return asyncLocalStorage.run({ tenantId, organizationId }, callback);
}

// NOTE: Prisma middleware application has been removed due to persistent issues.
// Tenant isolation will now be handled manually in service functions.


module.exports = { prisma, runWithTenant, asyncLocalStorage };