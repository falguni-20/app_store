const bcrypt = require("bcrypt");
const repo = require("../repositories/userRepo");
const { verifyRefreshToken, signTokens } = require("../utils/jwt");

const _formatUserWithMemberships = (user) => {
  if (!user) return null;

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
      organizationId: r.institute.organizationId,
      role: r.role,
    })),
  };
};

exports.loginUser = async (email, password) => {
  const user = await repo.findUserWithMemberships(email);

  if (!user) {
    throw new Error("User not found");
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    throw new Error("Invalid password");
  }

  return _formatUserWithMemberships(user);
};

exports.refreshAccessToken = async (refreshToken) => {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const user = await repo.findUserWithMemberships(decoded.email);

      if (!user) {
        throw new Error("User not found from refresh token");
      }

      const formattedUser = _formatUserWithMemberships(user);

      const { accessToken, refreshToken: newRefreshToken } = signTokens(formattedUser);

      return { accessToken, newRefreshToken, user: formattedUser };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  };
