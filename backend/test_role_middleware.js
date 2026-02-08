// Simple test for the role middleware fix
const { requireRole } = require('./src/middlewares/roleMiddleware');

// Mock response object
const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.responseData = data;
    return this;
  }
};

// Test 1: User has ORG_ADMIN role in the specific organization
console.log("Test 1: User has ORG_ADMIN role in the specific organization");
let mockReq1 = {
  orgId: 1,
  user: {
    organizations: [
      { orgId: 1, orgName: "Org A", role: "ORG_ADMIN" },
      { orgId: 2, orgName: "Org B", role: "USER" }
    ],
    institutes: []
  }
};

let nextCalled = false;
let next = () => { nextCalled = true; };

const middleware1 = requireRole(["ORG_ADMIN"]);
middleware1(mockReq1, mockRes, next);

if (nextCalled && !mockRes.responseData) {
  console.log("✓ Test 1 PASSED: User with ORG_ADMIN role in org 1 can access org 1");
} else {
  console.log("✗ Test 1 FAILED: User with ORG_ADMIN role in org 1 should be able to access org 1");
}

// Reset for next test
nextCalled = false;
mockRes.statusCode = null;
mockRes.responseData = null;

// Test 2: User does NOT have ORG_ADMIN role in the specific organization
console.log("\nTest 2: User does NOT have ORG_ADMIN role in the specific organization");
let mockReq2 = {
  orgId: 2,
  user: {
    organizations: [
      { orgId: 1, orgName: "Org A", role: "ORG_ADMIN" },
      { orgId: 2, orgName: "Org B", role: "USER" }
    ],
    institutes: []
  }
};

middleware1(mockReq2, mockRes, next);

if (!nextCalled && mockRes.responseData && mockRes.statusCode === 403) {
  console.log("✓ Test 2 PASSED: User with USER role in org 2 cannot access as ORG_ADMIN");
} else {
  console.log("✗ Test 2 FAILED: User with USER role in org 2 should not be able to access as ORG_ADMIN");
}

// Reset for next test
nextCalled = false;
mockRes.statusCode = null;
mockRes.responseData = null;

// Test 3: User has INSTITUTE_ADMIN role in the specific institute within the organization
console.log("\nTest 3: User has INSTITUTE_ADMIN role in the specific institute within the organization");
let mockReq3 = {
  orgId: 1,
  instituteId: 101,
  user: {
    organizations: [
      { orgId: 1, orgName: "Org A", role: "USER" }
    ],
    institutes: [
      { instituteId: 101, instituteName: "Inst A", organizationId: 1, role: "INSTITUTE_ADMIN" },
      { instituteId: 102, instituteName: "Inst B", organizationId: 1, role: "USER" }
    ]
  }
};

const middleware2 = requireRole(["INSTITUTE_ADMIN"]);
middleware2(mockReq3, mockRes, next);

if (nextCalled && !mockRes.responseData) {
  console.log("✓ Test 3 PASSED: User with INSTITUTE_ADMIN role in inst 101 can access");
} else {
  console.log("✗ Test 3 FAILED: User with INSTITUTE_ADMIN role in inst 101 should be able to access");
}

// Reset for next test
nextCalled = false;
mockRes.statusCode = null;
mockRes.responseData = null;

// Test 4: No organization context - check across all organizations and institutes
console.log("\nTest 4: No organization context - check across all organizations and institutes");
let mockReq4 = {
  // No orgId or instituteId
  user: {
    organizations: [
      { orgId: 1, orgName: "Org A", role: "USER" },
      { orgId: 2, orgName: "Org B", role: "ORG_ADMIN" }
    ],
    institutes: []
  }
};

const middleware3 = requireRole(["ORG_ADMIN"]);
middleware3(mockReq4, mockRes, next);

if (nextCalled && !mockRes.responseData) {
  console.log("✓ Test 4 PASSED: User with ORG_ADMIN in any org can access when no specific org context");
} else {
  console.log("✗ Test 4 FAILED: User with ORG_ADMIN in any org should be able to access when no specific org context");
}

console.log("\nAll tests completed!");