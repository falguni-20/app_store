const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/app_store_test';

let prisma;

async function setupTestDB() {
  try {
    const dbCreateConnection = new Pool({
      connectionString: 'postgresql://postgres:password@localhost:5432/postgres',
    });

    await dbCreateConnection.query(`CREATE DATABASE app_store_test WITH OWNER postgres;`);
    console.log('Test database created successfully');
    await dbCreateConnection.end();
  } catch (error) {
    console.log('Test database already exists or error creating it:', error.message);
  }

  const pool = new Pool({ connectionString: TEST_DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  try {
    execSync('npx prisma migrate deploy --schema=./src/prisma/schema.prisma', {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit'
    });
    console.log('Test database migrated successfully');
  } catch (error) {
    console.error('Error migrating test database:', error.message);
    throw error;
  }

  return prisma;
}

async function teardownTestDB() {
  if (prisma) {
    await prisma.$disconnect();
  }

  try {
    const dbDropConnection = new Pool({
      connectionString: 'postgresql://postgres:password@localhost:5432/postgres',
    });

    await dbDropConnection.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = 'app_store_test' AND pid <> pg_backend_pid();
    `);

    await dbDropConnection.query('DROP DATABASE IF EXISTS app_store_test;');
    console.log('Test database dropped successfully');
    await dbDropConnection.end();
  } catch (error) {
    console.error('Error dropping test database:', error.message);
  }
}

module.exports = {
  setupTestDB,
  teardownTestDB,
  getTestPrisma: () => prisma,
  TEST_DATABASE_URL,
};