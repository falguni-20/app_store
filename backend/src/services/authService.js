const bcrypt = require("bcrypt");
const repo = require("../repositories/userRepo");

exports.loginUser = async (email, password) => {
  const user = await repo.findUserWithMemberships(email);

  if (!user) {
    throw new Error("User not found");
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    throw new Error("Invalid password");
  }

  // shape clean response (important for reviewers)
  return {
    id: user.id,
    email: user.email,
    name: user.name,

    organizations: user.orgRoles.map((r) => ({
      orgId: r.organizationId,
      orgName: r.organization.name,
      role: r.role,
    })),

    institutes: user.instituteRoles.map((r) => ({
      instituteId: r.instituteId,
      instituteName: r.institute.name,
      role: r.role,
    })),
  };
};
