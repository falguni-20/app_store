const jwt = require("jsonwebtoken");

exports.signToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "1d" }
  );
};

exports.verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || "dev_secret"
  );
};
