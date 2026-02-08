const { prisma } = require("../config/db");

exports.getAppsForInstitute = async (instituteId, category, searchTerm, sortBy = "installedAt", page = 1, limit = 10) => {
  if (!instituteId) throw new Error("Institute ID is required");

  const skip = (page - 1) * limit;

  let whereClause = { instituteId };

  // Build app conditions based on filters
  let appConditions = {};
  let hasAppConditions = false;

  // Handle category filter
  if (category) {
    appConditions.category = category;
    hasAppConditions = true;
  }

  // Handle search term filter
  if (searchTerm) {
    // If we already have other app conditions, we need to wrap the search in AND with existing conditions
    if (hasAppConditions) {
      // When we have both category and search, we need to use AND with the search OR condition
      whereClause.app = {
        AND: [
          appConditions, // Existing conditions like category
          {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              { category: { contains: searchTerm, mode: 'insensitive' } }
            ]
          }
        ]
      };
    } else {
      // If no other conditions, just apply the search OR condition
      whereClause.app = {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };
    }
    hasAppConditions = true;
  } else if (hasAppConditions) {
    // If we only have category (or other non-search conditions), apply them directly
    whereClause.app = appConditions;
  }

  // Define the ordering based on sortBy parameter
  let orderBy = { installedAt: "desc" }; // Default ordering
  switch(sortBy) {
    case "name":
      orderBy = { app: { name: "asc" } };
      break;
    case "category":
      orderBy = { app: { category: "asc" } };
      break;
    case "installedAt":
    default:
      orderBy = { installedAt: "desc" };
      break;
  }

  const [apps, total] = await prisma.$transaction([
    prisma.instituteInstalledApp.findMany({
      where: whereClause,
      include: { app: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.instituteInstalledApp.count({ where: whereClause }),
  ]);

  return { apps, total, page, limit };
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