const instituteAppService = require("../services/instituteAppService");
const { AppError } = require("../utils/errorHandler");

exports.installApp = async (req, res, next) => {
  try {
    const { appId, settings } = req.body;
    const { instituteId } = req;
    const { id: userId } = req.user;

    const installedApp = await instituteAppService.installApp(instituteId, appId, settings, userId);
    res.status(201).json(installedApp);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.configureApp = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { settings } = req.body;
    const { instituteId } = req;

    const updatedApp = await instituteAppService.configureApp(instituteId, Number(appId), settings);
    res.json(updatedApp);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.uninstallApp = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { instituteId } = req;

    await instituteAppService.uninstallApp(instituteId, Number(appId));
    res.status(204).send();
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.toggleAppStatus = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { enabled } = req.body;
    const { instituteId } = req;

    if (typeof enabled !== 'boolean') {
      return next(new AppError("Enabled status must be a boolean", 400));
    }

    const updatedApp = await instituteAppService.toggleAppStatus(instituteId, Number(appId), enabled);
    res.json(updatedApp);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
