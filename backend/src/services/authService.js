const bcrypt = require("bcrypt");
const repo = require("../repositories/userRepo");
const { verifyRefreshToken, signTokens } = require("../utils/jwt"); // Import verifyRefreshToken and signTokens

// Helper function to format user data with memberships for JWT payload
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

  // Format the user object before returning, which will be used for token generation
  return _formatUserWithMemberships(user);
};

exports.refreshAccessToken = async (refreshToken) => {
    try {
      const decoded = verifyRefreshToken(refreshToken);
  
      // Re-fetch user to ensure latest roles/info
      const user = await repo.findUserWithMemberships(decoded.email); 
  
      if (!user) {
        throw new Error("User not found from refresh token");
      }
  
      // Format the user object before signing the tokens
      const formattedUser = _formatUserWithMemberships(user);

      const { accessToken, refreshToken: newRefreshToken } = signTokens(formattedUser);
  
      return { accessToken, newRefreshToken, user: formattedUser }; // Return formatted user
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  };
