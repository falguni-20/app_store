// This file simply re-exports the configured Prisma client from prismaClient.js
const { prisma, runWithTenant, asyncLocalStorage } = require('./prismaClient');

module.exports = { prisma, runWithTenant, asyncLocalStorage };