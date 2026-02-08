const { prisma } = require("../config/db");
const { generateWebhookSecret } = require("../utils/webhookSender");

// List all apps
exports.listAllApps = () => {
  return prisma.app.findMany({ orderBy: { createdAt: "desc" } });
};

// Create app
exports.createApp = (data) => {
  // Generate a webhook secret if one isn't provided
  const webhookSecret = data.webhookSecret || generateWebhookSecret();
  return prisma.app.create({ 
    data: {
      ...data,
      webhookSecret
    }
  });
};

// Update app
exports.updateApp = async (id, data) => {
  // If logoUrl is not provided in the update, remove it from the update data to preserve the existing value
  if (!data.logoUrl) {
    delete data.logoUrl;
  }
  
  return prisma.app.update({ where: { id }, data });
};

// Delete app
exports.deleteApp = (id) => {
  return prisma.app.delete({ where: { id } });
};
