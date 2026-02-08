const { prisma } = require("../config/db");

// Find all organizations
exports.findAllOrganizations = async () => {
  return prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
};

// Create a new organization
exports.createOrganization = async (name) => {
  return prisma.organization.create({
    data: {
      name,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
};

// Find organization by name
exports.findByName = async (name) => {
  return prisma.organization.findUnique({
    where: {
      name,
    },
  });
};

// Find organization by name excluding specific ID
exports.findByNameAndExcludeId = async (name, excludeId) => {
  return prisma.organization.findFirst({
    where: {
      name,
      id: { not: excludeId },
    },
  });
};

// Update organization
exports.updateOrganization = async (orgId, name) => {
  return prisma.organization.update({
    where: {
      id: orgId,
    },
    data: {
      name,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
};

// Delete organization
exports.deleteOrganization = async (orgId) => {
  // Note: This will fail if there are related records due to foreign key constraints
  // In a real-world scenario, you'd need to handle cascading deletes carefully
  return prisma.organization.delete({
    where: {
      id: orgId,
    },
  });
};

// Add user to organization
exports.addUserToOrganization = async (userId, orgId, role) => {
  return prisma.userOrganization.create({
    data: {
      userId,
      organizationId: orgId,
      role,
    },
  });
};