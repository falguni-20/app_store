const organizationManagementRepo = require("../repositories/organizationManagementRepo");

exports.getAllOrganizations = async () => {
  return organizationManagementRepo.findAllOrganizations();
};

exports.createOrganization = async (name, createdByUserId) => {
  const existingOrg = await organizationManagementRepo.findByName(name);
  if (existingOrg) {
    throw new Error("Organization with this name already exists");
  }

  const newOrganization = await organizationManagementRepo.createOrganization(name);

  await organizationManagementRepo.addUserToOrganization(createdByUserId, newOrganization.id, "SUPER_ADMIN");

  return newOrganization;
};

exports.updateOrganization = async (orgId, name) => {
  const existingOrg = await organizationManagementRepo.findByNameAndExcludeId(name, orgId);
  if (existingOrg) {
    throw new Error("Organization with this name already exists");
  }

  return organizationManagementRepo.updateOrganization(orgId, name);
};

exports.deleteOrganization = async (orgId) => {
  return organizationManagementRepo.deleteOrganization(orgId);
};