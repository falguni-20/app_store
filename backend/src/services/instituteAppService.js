const { prisma } = require("../config/db");
const appService = require("./appService");
const { sendWebhook } = require("../utils/webhookSender");

exports.installApp = async (instituteId, appId, settings, installedBy) => {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) {
    throw new Error("App not found");
  }

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

  const installedApp = await prisma.instituteInstalledApp.create({
    data: {
      instituteId,
      appId,
      settings,
      installedBy,
    },
  });

  if (app.webhookUrl) {
    sendWebhook(instituteId, appId, app.webhookUrl, {
      event: "institute_app_installed",
      instituteId,
      appId,
      settings,
    }).catch(error => {
      console.error(`Failed to send webhook for app installation:`, error.message);
    });
  }

  return installedApp;
};

exports.configureApp = async (instituteId, appId, settings) => {
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

  // Delete related webhook logs first to avoid foreign key constraint violation
  await prisma.webhookLog.deleteMany({
    where: {
      instituteId,
      appId,
    },
  });

  await prisma.instituteInstalledApp.delete({
    where: {
      instituteId_appId: {
        instituteId,
        appId,
      },
    },
  });

  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (app && app.webhookUrl) {
    sendWebhook(instituteId, appId, app.webhookUrl, {
      event: "institute_app_uninstalled",
      instituteId,
      appId,
    }).catch(error => {
      console.error(`Failed to send webhook for app uninstallation:`, error.message);
    });
  }
};

exports.toggleAppStatus = async (instituteId, appId, enabled) => {
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

  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (app && app.webhookUrl) {
    sendWebhook(instituteId, appId, app.webhookUrl, {
      event: enabled ? "institute_app_enabled" : "institute_app_disabled",
      instituteId,
      appId,
    }).catch(error => {
      console.error(`Failed to send webhook for app status change:`, error.message);
    });
  }

  return updatedApp;
};
