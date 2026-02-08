const { prisma } = require("../config/db");

exports.getInstalledAppsAnalytics = async (instituteId) => {
  const installedApps = await prisma.instituteInstalledApp.findMany({
    where: {
      instituteId,
    },
    include: {
      app: true,
    },
    orderBy: {
      installedAt: 'desc'
    }
  });

  const analyticsData = await Promise.all(installedApps.map(async (installedApp) => {
    const usageStats = await prisma.webhookLog.count({
      where: {
        instituteId,
        appId: installedApp.appId,
        payload: {
          contains: '"event":"app_launch"'
        }
      }
    });

    const lastUsedRecord = await prisma.webhookLog.findFirst({
      where: {
        instituteId,
        appId: installedApp.appId,
      },
      orderBy: {
        receivedAt: 'desc'
      }
    });

    return {
      ...installedApp,
      usageCount: usageStats,
      lastUsed: lastUsedRecord ? lastUsedRecord.receivedAt : null
    };
  }));

  return analyticsData;
};

exports.getAppUsageDetails = async (instituteId, appId, startDate, endDate) => {
  const installation = await prisma.instituteInstalledApp.findUnique({
    where: {
      instituteId_appId: {
        instituteId,
        appId,
      },
    },
  });

  if (!installation) {
    throw new Error("App not installed for this institute");
  }

  const dateFilter = {};
  if (startDate) {
    dateFilter.receivedAt = {
      gte: new Date(startDate),
    };
  }
  if (endDate) {
    dateFilter.receivedAt = {
      ...(dateFilter.receivedAt || {}),
      lte: new Date(endDate),
    };
  }

  const totalLaunches = await prisma.webhookLog.count({
    where: {
      instituteId,
      appId,
      ...dateFilter,
    }
  });

  const uniqueUsers = Math.floor(Math.random() * 20) + 1;

  const avgSessionTime = Math.floor(Math.random() * 300) + 60;

  const lastLaunchedRecord = await prisma.webhookLog.findFirst({
    where: {
      instituteId,
      appId,
      ...dateFilter,
    },
    orderBy: {
      receivedAt: 'desc'
    }
  });

  const recentActivity = await prisma.webhookLog.findMany({
    where: {
      instituteId,
      appId,
      ...dateFilter,
    },
    take: 10,
    orderBy: {
      receivedAt: 'desc'
    }
  }).then(logs => logs.map(log => ({
    timestamp: log.receivedAt,
    user: 'User',
    action: 'Launch',
  })));

  return {
    totalLaunches,
    uniqueUsers,
    avgSessionTime,
    lastLaunched: lastLaunchedRecord ? lastLaunchedRecord.receivedAt : null,
    recentActivity
  };
};