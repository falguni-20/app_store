const { prisma } = require("../config/db");
const { generateWebhookSecret } = require("../utils/webhookSender");

exports.listAllApps = () => {
  return prisma.app.findMany({ orderBy: { createdAt: "desc" } });
};

exports.listAllAppsWithPagination = async (page = 1, limit = 10, category = null, searchTerm = null) => {
  const skip = (page - 1) * limit;

  // Build the where clause with optional filters
  let whereClause = {};
  
  if (category) {
    whereClause.category = category;
  }
  
  if (searchTerm) {
    whereClause.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { category: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  const [apps, total] = await prisma.$transaction([
    prisma.app.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.app.count({ where: whereClause }),
  ]);

  return {
    apps,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

exports.createApp = (data) => {
  const webhookSecret = data.webhookSecret || generateWebhookSecret();
  return prisma.app.create({
    data: {
      ...data,
      webhookSecret
    }
  });
};

exports.updateApp = async (id, data) => {
  if (!data.logoUrl) {
    delete data.logoUrl;
  }

  return prisma.app.update({ where: { id }, data });
};

exports.deleteApp = (id) => {
  return prisma.app.delete({ where: { id } });
};
