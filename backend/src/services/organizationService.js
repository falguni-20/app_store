const organizationRepo = require("../repositories/organizationRepo");
const userRepo = require("../repositories/userRepo");

exports.getAllOrganizations = async () => {
  return organizationRepo.findAllOrganizations();
};

exports.getInstalledAppsByOrganization = async (orgId) => {
  return organizationRepo.findInstalledAppsByOrganization(orgId);
};

exports.getInstitutesByOrganization = async (orgId) => {
  return organizationRepo.findInstitutesByOrganization(orgId);
};

exports.createInstitute = async (orgId, name, userId) => {
  return organizationRepo.createInstitute(orgId, name, userId);
};

exports.getUsersInOrganization = async (orgId) => {
  return organizationRepo.findUsersInOrganization(orgId);
};

exports.inviteUserToOrganization = async (orgId, email, role, invitedById) => {
  const user = await userRepo.findByEmail(email);

  if (!user) {
    throw new Error("User not found with this email");
  }

  const existingMembership = await organizationRepo.findUserOrganizationMembership(user.id, orgId);
  if (existingMembership) {
    throw new Error("User is already a member of this organization");
  }

  return organizationRepo.addUserToOrganization(user.id, orgId, role, invitedById);
};