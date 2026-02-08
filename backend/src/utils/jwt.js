const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const LAUNCH_TOKEN_SECRET = process.env.LAUNCH_TOKEN_SECRET || "launch_secret";

exports.signToken = (payload, secret = ACCESS_TOKEN_SECRET, expiresIn = "15m") => {
  return jwt.sign(payload, secret, { expiresIn });
};

exports.signTokens = (payload) => {
  const accessToken = jwt.sign(
    payload,
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    payload,
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

exports.verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

exports.verifyToken = (token, secret = ACCESS_TOKEN_SECRET) => {
  return jwt.verify(token, secret);
};
