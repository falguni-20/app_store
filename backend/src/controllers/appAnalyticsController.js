const appAnalyticsService = require("../services/appAnalyticsService");
const { AppError } = require("../utils/errorHandler");

exports.getInstalledAppsAnalytics = async (req, res, next) => {
  try {
    const { instituteId } = req;

    const analyticsData = await appAnalyticsService.getInstalledAppsAnalytics(instituteId);
    res.json(analyticsData);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.getAppUsageDetails = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { startDate, endDate } = req.query;
    const { instituteId } = req;

    const usageDetails = await appAnalyticsService.getAppUsageDetails(instituteId, Number(appId), startDate, endDate);
    res.json(usageDetails);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};