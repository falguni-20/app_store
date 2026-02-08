const organizationManagementRepo = require("../repositories/organizationManagementRepo");

// Get all organizations
exports.getAllOrganizations = async () => {
  return organizationManagementRepo.findAllOrganizations();
};

// Create a new organization
exports.createOrganization = async (name, createdByUserId) => {
  // Check if organization with this name already exists
  const existingOrg = await organizationManagementRepo.findByName(name);
  if (existingOrg) {
    throw new Error("Organization with this name already exists");
  }

  // Create the organization
  const newOrganization = await organizationManagementRepo.createOrganization(name);

  // Add the creating user as a SUPER_ADMIN of the new organization
  await organizationManagementRepo.addUserToOrganization(createdByUserId, newOrganization.id, "SUPER_ADMIN");

  return newOrganization;
};

// Update organization
exports.updateOrganization = async (orgId, name) => {
  // Check if organization with this name already exists (excluding current org)
  const existingOrg = await organizationManagementRepo.findByNameAndExcludeId(name, orgId);
  if (existingOrg) {
    throw new Error("Organization with this name already exists");
  }

  return organizationManagementRepo.updateOrganization(orgId, name);
};

// Delete organization
exports.deleteOrganization = async (orgId) => {
  // TODO: Add validation to ensure organization can be deleted
  // For example, check if it has any institutes, users, or installed apps
  
  return organizationManagementRepo.deleteOrganization(orgId);
};