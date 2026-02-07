const authService = require("../services/authService");
const { signToken } = require("../utils/jwt");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authService.loginUser(email, password);

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      token,
      user,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
