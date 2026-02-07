const prisma = require("../config/db");

exports.findUserWithMemberships = (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      orgRoles: {
        include: {
          organization: true,
        },
      },
      instituteRoles: {
        include: {
          institute: true,
        },
      },
    },
  });
};
