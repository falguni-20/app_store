// Detailed test to simulate the exact middleware flow
const { requireRole } = require('./src/middlewares/roleMiddleware');

// Mock tenantAuth middleware
function mockTenantAuth(req, res, next) {
    const orgId = Number(req.headers["x-org-id"]);
    const instituteId = Number(req.headers["x-institute-id"]);

    if (!orgId) {
      return res.status(400).json({ message: "X-Org-Id header required" });
    }

    const hasOrgAccess = req.user.organizations.some(
      (org) => org.orgId === orgId
    );
    if (!hasOrgAccess) {
      return res.status(403).json({ message: "Forbidden: No access to this organization" });
    }

    if (instituteId) {
      const hasInstituteAccess = req.user.institutes.some(
        (institute) => institute.instituteId === instituteId
      );
      if (!hasInstituteAccess) {
        return res.status(403).json({ message: "Forbidden: No access to this institute" });
      }
    }

    req.orgId = orgId;
    if (instituteId) {
      req.instituteId = instituteId;
    }
    next();
}

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

// Simulate the exact flow that happens in the routes
console.log("Testing the exact middleware flow that occurs in organization routes:");

let mockReq = {
  headers: {
    "x-org-id": "1"
  },
  user: {
    id: 1,
    email: "org.admin@example.com",
    name: "Org Admin",
    organizations: [
      { orgId: 1, orgName: "Org A", role: "ORG_ADMIN" },
      { orgId: 2, orgName: "Org B", role: "USER" }
    ],
    institutes: []
  }
};

console.log("Initial request:", {
  orgId: mockReq.orgId,
  headers: mockReq.headers,
  userHasOrgRole: mockReq.user.organizations.find(org => org.orgId === 1)?.role
});

let nextCalled = false;
let next = () => { nextCalled = true; console.log("Next called"); };

// Step 1: Run tenantAuth (this should set req.orgId)
console.log("\nStep 1: Running tenantAuth middleware...");
mockTenantAuth(mockReq, mockRes, () => {
  console.log("After tenantAuth - req.orgId:", mockReq.orgId);
  console.log("User organizations:", mockReq.user.organizations);
  
  // Step 2: Run requireRole middleware
  console.log("\nStep 2: Running requireRole middleware...");
  const canManageOrganization = requireRole(["ORG_ADMIN", "SUPER_ADMIN"]);
  canManageOrganization(mockReq, mockRes, next);
  
  console.log("Final state:");
  console.log("- nextCalled:", nextCalled);
  console.log("- Response data:", mockRes.responseData);
  console.log("- Status code:", mockRes.statusCode);
  
  if (nextCalled && !mockRes.responseData) {
    console.log("✅ SUCCESS: User was granted access as expected");
  } else if (mockRes.responseData && mockRes.statusCode === 403) {
    console.log("❌ FAILURE: User was denied access unexpectedly");
  }
});

// Test another scenario - user has access to org but wrong role
console.log("\n\nTesting scenario where user belongs to org but has wrong role:");
nextCalled = false;
mockRes.statusCode = null;
mockRes.responseData = null;

let mockReq2 = {
  headers: {
    "x-org-id": "2"  // User is only a USER in org 2
  },
  user: {
    id: 1,
    email: "regular.user@example.com",
    name: "Regular User",
    organizations: [
      { orgId: 1, orgName: "Org A", role: "USER" },  // Just a user in org A
      { orgId: 2, orgName: "Org B", role: "USER" }   // Just a user in org B
    ],
    institutes: []
  }
};

console.log("Initial request:", {
  orgId: mockReq2.orgId,
  headers: mockReq2.headers,
  userHasOrgRole: mockReq2.user.organizations.find(org => org.orgId === 2)?.role
});

mockTenantAuth(mockReq2, mockRes, () => {
  console.log("After tenantAuth - req.orgId:", mockReq2.orgId);
  
  // Step 2: Run requireRole middleware
  const canManageOrganization = requireRole(["ORG_ADMIN", "SUPER_ADMIN"]);
  canManageOrganization(mockReq2, mockRes, next);
  
  console.log("Final state:");
  console.log("- nextCalled:", nextCalled);
  console.log("- Response data:", mockRes.responseData);
  console.log("- Status code:", mockRes.statusCode);
  
  if (!nextCalled && mockRes.responseData && mockRes.statusCode === 403) {
    console.log("✅ SUCCESS: User was correctly denied access (has USER role but needs ORG_ADMIN)");
  } else {
    console.log("❌ FAILURE: User should have been denied access");
  }
});