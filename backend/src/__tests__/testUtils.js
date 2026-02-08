// test/helpers/testUtils.js
const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../src/config/db');
const app = require('../../src/app'); // Adjust path as needed

// Helper function to create a test user
const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password || 'password123', 10);
  return prisma.user.create({
    data: {
      name: userData.name || 'Test User',
      email: userData.email || `test-${Date.now()}@example.com`,
      password: hashedPassword,
    },
  });
};

// Helper function to create a test organization
const createOrganization = async (orgData) => {
  return prisma.organization.create({
    data: {
      name: orgData.name || `Test Organization ${Date.now()}`,
    },
  });
};

// Helper function to create a test institute
const createInstitute = async (instituteData) => {
  return prisma.institute.create({
    data: {
      name: instituteData.name || `Test Institute ${Date.now()}`,
      organizationId: instituteData.organizationId,
    },
  });
};

// Helper function to create a test app
const createApp = async (appData) => {
  return prisma.app.create({
    data: {
      name: appData.name || `Test App ${Date.now()}`,
      description: appData.description || 'Test App Description',
      category: appData.category || 'Test Category',
      launchUrl: appData.launchUrl || 'http://test-app.com/launch',
      webhookUrl: appData.webhookUrl || 'http://test-app.com/webhook',
      requiredPermissions: appData.requiredPermissions || { permissions: [] },
    },
  });
};

// Helper function to generate JWT token for testing
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-jwt-secret', { expiresIn: '1h' });
};

module.exports = {
  request,
  app,
  createUser,
  createOrganization,
  createInstitute,
  createApp,
  generateToken,
  prisma,
};