module.exports = {
  "testEnvironment": "node",
  "roots": [
    "<rootDir>/src"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/config/**",
    "!src/prisma/**"
  ],
  "coverageDirectory": "./coverage",
  "coverageReporters": ["text", "lcov", "html"],
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
  "testPathIgnorePatterns": ["/node_modules/", "/src/__tests__/test.config.js", "/src/__tests__/testUtils.js"]
};