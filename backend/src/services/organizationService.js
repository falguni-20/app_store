const organizationRepo = require("../repositories/organizationRepo");
const userRepo = require("../repositories/userRepo");

exports.getInstitutesByOrganization = async (orgId) => {
  return organizationRepo.findInstitutesByOrganization(orgId);
};

exports.createInstitute = async (orgId, name, userId) => {
  return organizationRepo.createInstitute(orgId, name, userId);
};

// Get users in an organization
exports.getUsersInOrganization = async (orgId) => {
  return organizationRepo.findUsersInOrganization(orgId);
};

// Invite user to organization
exports.inviteUserToOrganization = async (orgId, email, role, invitedById) => {
  // Find the user by email
  const user = await userRepo.findByEmail(email);
  
  if (!user) {
    throw new Error("User not found with this email");
  }

  // Check if user is already in the organization
  const existingMembership = await organizationRepo.findUserOrganizationMembership(user.id, orgId);
  if (existingMembership) {
    throw new Error("User is already a member of this organization");
  }

  // Add user to organization with specified role
  return organizationRepo.addUserToOrganization(user.id, orgId, role, invitedById);
};