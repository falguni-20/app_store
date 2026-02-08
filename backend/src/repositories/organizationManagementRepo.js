const { prisma } = require("../config/db");

exports.findAllOrganizations = async () => {
  return prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
};

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

exports.findByName = async (name) => {
  return prisma.organization.findUnique({
    where: {
      name,
    },
  });
};

exports.findByNameAndExcludeId = async (name, excludeId) => {
  return prisma.organization.findFirst({
    where: {
      name,
      id: { not: excludeId },
    },
  });
};

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

exports.deleteOrganization = async (orgId) => {
  return prisma.organization.delete({
    where: {
      id: orgId,
    },
  });
};

exports.addUserToOrganization = async (userId, orgId, role) => {
  return prisma.userOrganization.create({
    data: {
      userId,
      organizationId: orgId,
      role,
    },
  });
};