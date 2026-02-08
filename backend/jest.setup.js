// jest.setup.js
// Setup code for Jest tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';