const { prisma } = require("../config/db");

exports.getAppsForInstitute = async (instituteId, category, page = 1, limit = 10) => {
  if (!instituteId) throw new Error("Institute ID is required");

  const skip = (page - 1) * limit;

  const whereClause = { instituteId };

  if (category) {
    whereClause.app = { category }; // optional filtering
  }

  const [apps, total] = await prisma.$transaction([
    prisma.instituteInstalledApp.findMany({
      where: whereClause,
      include: { app: true },
      orderBy: { installedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.instituteInstalledApp.count({ where: whereClause }),
  ]);

  return { apps, total, page, limit };
};

// Get details of an installed app for a specific institute
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

// Get details of any app by ID (platform-wide, not tenant-specific)
exports.getAvailableAppById = async (appId) => {
    const app = await prisma.app.findUnique({
        where: { id: Number(appId) },
    });
    if (!app) {
        throw new Error("App not found");
    }
    return app;
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