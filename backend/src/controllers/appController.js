const appService = require("../services/appService");
const adminAppService = require("../services/adminAppService");
const { signToken } = require("../utils/jwt");
const { AppError } = require("../utils/errorHandler");

exports.listApps = async (req, res, next) => {
  try {
    const { category, searchTerm, sortBy, page = 1, limit = 10 } = req.query;
    const { instituteId } = req;

    const { apps, total, page: currentPage, limit: currentLimit } = await appService.getAppsForInstitute(
      instituteId,
      category,
      searchTerm,
      sortBy,
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
    const { instituteId, orgId } = req;
    const { userId } = req.user;

    const installedApp = await appService.getInstalledApp(appId, instituteId);

    if (!installedApp) {
      return next(new AppError("App not installed for this institute", 404));
    }

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

exports.listAllApps = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, searchTerm } = req.query;
    const result = await adminAppService.listAllAppsWithPagination(
      parseInt(page),
      parseInt(limit),
      category,
      searchTerm
    );
    res.json(result);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};