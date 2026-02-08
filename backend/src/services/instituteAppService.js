const { prisma } = require("../config/db");
const appService = require("./appService"); // Re-using existing app service to get app details
const { sendWebhook } = require("../utils/webhookSender");

exports.installApp = async (instituteId, appId, settings, installedBy) => {
  // Check if app exists
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) {
    throw new Error("App not found");
  }

  // Check if app is already installed for this institute
  const existingInstallation = await prisma.instituteInstalledApp.findUnique({
    where: {
      instituteId_appId: {
        instituteId,
        appId,
      },
    },
  });

  if (existingInstallation) {
    throw new Error("App already installed for this institute");
  }

  // Create installation
  const installedApp = await prisma.instituteInstalledApp.create({
    data: {
      instituteId,
      appId,
      settings,
      installedBy,
    },
  });

  // Trigger webhook for app installation
  if (app.webhookUrl) {
    // Send webhook asynchronously to not block the main operation
    sendWebhook(instituteId, appId, app.webhookUrl, {
      event: "institute_app_installed",
      instituteId,
      appId,
      settings,
    }).catch(error => {
      console.error(`Failed to send webhook for app installation:`, error.message);
      // Don't throw error - we don't want webhook failures to break the main functionality
    });
  }

  return installedApp;
};

exports.configureApp = async (instituteId, appId, settings) => {
    // Check if app is installed for this institute
    const existingInstallation = await prisma.instituteInstalledApp.findUnique({
      where: {
        instituteId_appId: {
          instituteId,
          appId,
        },
      },
    });

    if (!existingInstallation) {
      throw new Error("App not installed for this institute");
    }

    // Update settings
    const updatedApp = await prisma.instituteInstalledApp.update({
      where: {
        instituteId_appId: {
          instituteId,
          appId,
        },
      },
      data: {
        settings,
      },
    });

    return updatedApp;
  };

exports.uninstallApp = async (instituteId, appId) => {
  // Check if app is installed for this institute
  const existingInstallation = await prisma.instituteInstalledApp.findUnique({
    where: {
      instituteId_appId: {
        instituteId,
        appId,
      },
    },
  });

  if (!existingInstallation) {
    throw new Error("App not installed for this institute");
  }

  // Delete the installation
  await prisma.instituteInstalledApp.delete({
    where: {
      instituteId_appId: {
        instituteId,
        appId,
      },
    },
  });

  // Optionally trigger a webhook for app uninstallation
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (app && app.webhookUrl) {
    // Send webhook asynchronously to not block the main operation
    sendWebhook(instituteId, appId, app.webhookUrl, {
      event: "institute_app_uninstalled",
      instituteId,
      appId,
    }).catch(error => {
      console.error(`Failed to send webhook for app uninstallation:`, error.message);
      // Don't throw error - we don't want webhook failures to break the main functionality
    });
  }
};

// Toggle app enabled/disabled status
exports.toggleAppStatus = async (instituteId, appId, enabled) => {
  // Check if app is installed for this institute
  const existingInstallation = await prisma.instituteInstalledApp.findUnique({
    where: {
      instituteId_appId: {
        instituteId,
        appId,
      },
    },
  });

  if (!existingInstallation) {
    throw new Error("App not installed for this institute");
  }

  // Update the enabled status
  const updatedApp = await prisma.instituteInstalledApp.update({
    where: {
      instituteId_appId: {
        instituteId,
        appId,
      },
    },
    data: {
      enabled,
    },
  });

  // Optionally trigger a webhook for app status change
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (app && app.webhookUrl) {
    // Send webhook asynchronously to not block the main operation
    sendWebhook(instituteId, appId, app.webhookUrl, {
      event: enabled ? "institute_app_enabled" : "institute_app_disabled",
      instituteId,
      appId,
    }).catch(error => {
      console.error(`Failed to send webhook for app status change:`, error.message);
      // Don't throw error - we don't want webhook failures to break the main functionality
    });
  }

  return updatedApp;
};
