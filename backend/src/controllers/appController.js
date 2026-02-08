const appService = require("../services/appService");
const adminAppService = require("../services/adminAppService"); // Import admin app service to list all apps
const { signToken } = require("../utils/jwt");
const { AppError } = require("../utils/errorHandler");

exports.listApps = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const { instituteId } = req; // set by tenant middleware

    const { apps, total, page: currentPage, limit: currentLimit } = await appService.getAppsForInstitute(
      instituteId,
      category,
      Number(page),
      Number(limit)
    );
    res.json({ apps, total, page: currentPage, limit: currentLimit });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};


exports.getApp = async (req, res, next) => {
  try {
    const { instituteId } = req;
    const appId = Number(req.params.id);

    const app = await appService.getAppById(appId, Number(instituteId));
    res.json(app);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.getAppDetail = async (req, res, next) => {
    try {
        const { appId } = req.params;
        const app = await appService.getAvailableAppById(appId);
        res.json(app);
    } catch (err) {
        next(new AppError(err.message, 500));
    }
};

exports.launchApp = async (req, res, next) => {
  try {

    const { appId } = req.params;
    const { instituteId, orgId } = req; // set by tenant middleware
    const { userId } = req.user; // set by protect middleware

    // Get installed app
    const installedApp = await appService.getInstalledApp(appId, instituteId);

    if (!installedApp) {
      return next(new AppError("App not installed for this institute", 404));
    }

    // Prepare launch token
    const tokenPayload = {
      userId,
      instituteId,
      orgId,
      appId,
      permissions: installedApp.app.requiredPermissions,
      settings: installedApp.settings,
    };

    const launchToken = signToken(tokenPayload);

    res.json({
      launchUrl: installedApp.app.launchUrl,
      launchToken,
      settings: installedApp.settings,
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// List all apps (for institute admins to see what's available to install)
exports.listAllApps = async (req, res, next) => {
  try {
    const apps = await adminAppService.listAllApps();
    res.json(apps);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};