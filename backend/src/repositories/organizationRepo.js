const { prisma } = require("../config/db");

exports.findInstalledAppsByOrganization = async (orgId) => {
  return prisma.instituteInstalledApp.findMany({
    where: {
      institute: {
        organizationId: orgId,
      },
    },
    include: {
      app: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          description: true,
          category: true,
          launchUrl: true,
        },
      },
      institute: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

exports.findAllOrganizations = async () => {
  return prisma.organization.findMany({
    select: {
      id: true,
      name: true,
    },
  });
};

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
        role: "USER",
      },
    });

    return newInstitute;
  });
};

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