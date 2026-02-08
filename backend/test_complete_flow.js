// Test the complete flow including controller validation
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
  },
  send: function(data) {
    this.responseData = data;
    return this;
  }
};

// Mock next function that creates an AppError
function createAppError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

console.log("Testing complete flow with controller validation (matching IDs):");

let mockReq = {
  headers: {
    "x-org-id": "1"
  },
  params: {
    orgId: "1"  // Same as header
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

console.log("Request setup:");
console.log("- URL orgId param:", mockReq.params.orgId);
console.log("- Header x-org-id:", mockReq.headers["x-org-id"]);

let middlewareError = null;
let controllerError = null;

// Step 1: Run tenantAuth (this should set req.orgId)
mockTenantAuth(mockReq, mockRes, (err) => {
  if (err) middlewareError = err;
  console.log("After tenantAuth - req.orgId:", mockReq.orgId);
  
  // Step 2: Run requireRole middleware
  const canManageOrganization = requireRole(["ORG_ADMIN", "SUPER_ADMIN"]);
  canManageOrganization(mockReq, mockRes, (err) => {
    if (err) middlewareError = err;
    console.log("After requireRole - next called");
    
    // Step 3: Simulate controller validation
    const orgIdFromParams = Number(mockReq.params.orgId);
    console.log("Comparing req.orgId:", mockReq.orgId, "with req.params.orgId:", orgIdFromParams);
    
    if (mockReq.orgId !== orgIdFromParams) {
      controllerError = createAppError("Forbidden: Access to this organization is denied.", 403);
      console.log("Controller validation failed");
    } else {
      console.log("Controller validation passed");
    }
    
    // Results
    console.log("\nResults:");
    console.log("- Middleware error:", !!middlewareError);
    console.log("- Controller error:", !!controllerError);
    console.log("- Overall success:", !middlewareError && !controllerError);
  });
});

console.log("\n\nTesting scenario with mismatched IDs (should fail at controller level):");

let mockReq2 = {
  headers: {
    "x-org-id": "1"  // User has access to org 1
  },
  params: {
    orgId: "2"  // But URL is requesting org 2
  },
  user: {
    id: 1,
    email: "org.admin@example.com",
    name: "Org Admin",
    organizations: [
      { orgId: 1, orgName: "Org A", role: "ORG_ADMIN" },
      { orgId: 2, orgName: "Org B", role: "USER" }  // Only USER in org 2
    ],
    institutes: []
  }
};

console.log("Request setup:");
console.log("- URL orgId param:", mockReq2.params.orgId);
console.log("- Header x-org-id:", mockReq2.headers["x-org-id"]);

middlewareError = null;
controllerError = null;

// Step 1: Run tenantAuth (this should set req.orgId)
mockTenantAuth(mockReq2, mockRes, (err) => {
  if (err) middlewareError = err;
  console.log("After tenantAuth - req.orgId:", mockReq2.orgId);
  
  // Step 2: Run requireRole middleware
  const canManageOrganization = requireRole(["ORG_ADMIN", "SUPER_ADMIN"]);
  canManageOrganization(mockReq2, mockRes, (err) => {
    if (err) middlewareError = err;
    console.log("After requireRole - next called");
    
    // Step 3: Simulate controller validation
    const orgIdFromParams = Number(mockReq2.params.orgId);
    console.log("Comparing req.orgId:", mockReq2.orgId, "with req.params.orgId:", orgIdFromParams);
    
    if (mockReq2.orgId !== orgIdFromParams) {
      controllerError = createAppError("Forbidden: Access to this organization is denied.", 403);
      console.log("Controller validation failed - IDs don't match");
    } else {
      console.log("Controller validation passed");
    }
    
    // Results
    console.log("\nResults:");
    console.log("- Middleware error:", !!middlewareError);
    console.log("- Controller error:", !!controllerError);
    console.log("- Overall success:", !middlewareError && !controllerError);
  });
});