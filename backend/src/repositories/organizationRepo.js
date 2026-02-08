const { prisma } = require("../config/db");

exports.findInstitutesByOrganization = async (orgId) => {
  return prisma.institute.findMany({
    where: {
      organizationId: orgId,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

exports.createInstitute = async (orgId, name, userId) => {
  return prisma.$transaction(async (tx) => {
    const newInstitute = await tx.institute.create({
      data: {
        name,
        organizationId: orgId,
      },
    });

    await tx.userInstitute.create({
      data: {
        userId: userId,
        instituteId: newInstitute.id,
        role: "USER", // Assign the creator as a regular USER of the new institute
      },
    });

    return newInstitute;
  });
};

// Find users in an organization
exports.findUsersInOrganization = async (orgId) => {
  return prisma.userOrganization.findMany({
    where: {
      organizationId: orgId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    select: {
      id: true,
      role: true,
      user: true,
    }
  });
};

// Find if a user is already a member of an organization
exports.findUserOrganizationMembership = async (userId, orgId) => {
  return prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: orgId
      }
    }
  });
};

// Add user to organization
exports.addUserToOrganization = async (userId, orgId, role, invitedById) => {
  return prisma.userOrganization.create({
    data: {
      userId,
      organizationId: orgId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });
};