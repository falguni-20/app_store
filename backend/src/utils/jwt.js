const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

exports.signTokens = (payload) => {
  const accessToken = jwt.sign(
    payload,
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // Access token expires in 15 minutes
  );
  const refreshToken = jwt.sign(
    payload,
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // Refresh token expires in 7 days
  );
  return { accessToken, refreshToken };
};

exports.verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
