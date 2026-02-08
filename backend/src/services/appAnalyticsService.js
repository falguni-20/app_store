const { prisma } = require("../config/db");

// Get analytics for all installed apps
exports.getInstalledAppsAnalytics = async (instituteId) => {
  // Get all installed apps with their basic info and usage stats
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

  // For each installed app, get usage statistics
  const analyticsData = await Promise.all(installedApps.map(async (installedApp) => {
    // In a real implementation, you would have actual usage tracking data
    // For now, we'll simulate this with mock data based on launch events
    const usageStats = await prisma.webhookLog.count({
      where: {
        instituteId,
        appId: installedApp.appId,
        // Assuming webhook logs represent app launches
        payload: {
          contains: '"event":"app_launch"' // This is a simplified assumption
        }
      }
    });

    // Get last used date
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

// Get detailed usage for a specific app
exports.getAppUsageDetails = async (instituteId, appId, startDate, endDate) => {
  // Validate that the app is installed for this institute
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

  // Build where clause for date range if provided
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

  // Get detailed usage statistics
  const totalLaunches = await prisma.webhookLog.count({
    where: {
      instituteId,
      appId,
      ...dateFilter,
    }
  });

  // Get unique users (this would require user tracking in webhook logs)
  // For now, we'll return a mock value
  const uniqueUsers = Math.floor(Math.random() * 20) + 1; // Mock data

  // Get average session time (mock data)
  const avgSessionTime = Math.floor(Math.random() * 300) + 60; // Random between 60-360 seconds

  // Get last launched date
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

  // Get recent activity (last 10 events)
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
    user: 'User', // In a real implementation, this would come from the payload
    action: 'Launch', // In a real implementation, this would come from the payload
  })));

  return {
    totalLaunches,
    uniqueUsers,
    avgSessionTime,
    lastLaunched: lastLaunchedRecord ? lastLaunchedRecord.receivedAt : null,
    recentActivity
  };
};