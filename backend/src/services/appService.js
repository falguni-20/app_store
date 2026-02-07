const prisma = require("../config/db");

exports.getAppsForInstitute = async (instituteId, category) => {
  if (!instituteId) throw new Error("Institute ID is required");

  const whereClause = { instituteId };

  if (category) {
    whereClause.app = { category }; // optional filtering
  }

  const apps = await prisma.instituteInstalledApp.findMany({
    where: whereClause,
    include: { app: true },
    orderBy: { installedAt: "desc" },
  });

  return apps;
};


exports.getAppById = async (appId, instituteId) => {
  const installedApp = await prisma.instituteInstalledApp.findUnique({
    where: { instituteId_appId: { instituteId, appId } },
    include: { app: true },
  });

  if (!installedApp) throw new Error("App not found for this institute");

  return {
    id: installedApp.app.id,
    name: installedApp.app.name,
    description: installedApp.app.description,
    category: installedApp.app.category,
    logoUrl: installedApp.app.logoUrl,
    settings: installedApp.settings,
    installedAt: installedApp.installedAt,
  };
};


exports.getInstalledApp = async (appId, instituteId) => {
  return prisma.instituteInstalledApp.findUnique({
    where: {
      instituteId_appId: {
        instituteId,
        appId: Number(appId),
      },
    },
    include: {
      app: true,
    },
  });
};