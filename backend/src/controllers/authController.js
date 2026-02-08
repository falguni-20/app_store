const authService = require("../services/authService");
const { signTokens } = require("../utils/jwt"); // Changed to signTokens
const { AppError } = require("../utils/errorHandler");


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authService.loginUser(email, password);

    const { accessToken, refreshToken } = signTokens(user); // Use signTokens

    res.json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    next(new AppError(err.message, 401));
  }
};

exports.refreshToken = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
  
      if (!refreshToken) {
        return next(new AppError("Refresh token not provided", 400));
      }
  
      const { accessToken, newRefreshToken, user } = await authService.refreshAccessToken(refreshToken);
  
      res.json({
        accessToken,
        refreshToken: newRefreshToken,
        user,
      });
    } catch (err) {
      next(new AppError(err.message, 403)); // 403 Forbidden for invalid refresh token
    }
  };
