const appService = require("../services/appService");
const { signToken } = require("../utils/jwt");

exports.listApps = async (req, res) => {
  try {
    const apps = await appService.getAppsForInstitute(req.instituteId);
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.getApp = async (req, res) => {
  try {
    const { instituteId } = req.headers;
    const appId = Number(req.params.id);

    const app = await appService.getAppById(appId, Number(instituteId));
    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch app" });
  }
};

exports.launchApp = async (req, res) => {
  try {

    const { appId } = req.params;
    const { instituteId, orgId } = req; // set by tenant middleware
    const { userId } = req.user; // set by protect middleware

    // Get installed app
    const installedApp = await appService.getInstalledApp(appId, instituteId);

    if (!installedApp) {
      return res.status(404).json({ message: "App not installed for this institute" });
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
    console.error(err);
    res.status(500).json({ message: "Failed to launch app" });
  }
};
