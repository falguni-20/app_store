const appAnalyticsService = require("../services/appAnalyticsService");
const { AppError } = require("../utils/errorHandler");

// Get analytics for all installed apps
exports.getInstalledAppsAnalytics = async (req, res, next) => {
  try {
    const { instituteId } = req; // From tenantAuth middleware
    
    const analyticsData = await appAnalyticsService.getInstalledAppsAnalytics(instituteId);
    res.json(analyticsData);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// Get detailed usage for a specific app
exports.getAppUsageDetails = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { startDate, endDate } = req.query;
    const { instituteId } = req; // From tenantAuth middleware

    const usageDetails = await appAnalyticsService.getAppUsageDetails(instituteId, Number(appId), startDate, endDate);
    res.json(usageDetails);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};