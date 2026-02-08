const crypto = require("crypto");
const axios = require("axios");
const { prisma } = require("../config/db");

// Global fallback secret
const GLOBAL_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "supersecretwebhookkey";

// Generate a random webhook secret for an app
exports.generateWebhookSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send webhook with app-specific secret and retry mechanism
exports.sendWebhook = async (instituteId, appId, url, payload) => {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Get the app to retrieve its webhook secret
      const app = await prisma.app.findUnique({
        where: { id: appId },
        select: { webhookSecret: true, webhookUrl: true }
      });

      const secret = app?.webhookSecret || GLOBAL_WEBHOOK_SECRET;
      const payloadString = JSON.stringify(payload);
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(payloadString);
      const signature = hmac.digest("hex");

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
        },
        timeout: 10000, // 10 second timeout
      });
      
      // Log successful webhook
      await prisma.webhookLog.create({
        data: {
          instituteId,
          appId,
          payload,
          statusCode: response.status,
        }
      });
      
      console.log(`Webhook sent successfully to ${url} with status ${response.status} on attempt ${attempt}`);
      return response;
    } catch (error) {
      // Log failed webhook attempt
      await prisma.webhookLog.create({
        data: {
          instituteId,
          appId,
          payload,
          statusCode: error.response?.status || 0,
        }
      });
      
      console.error(`Webhook attempt ${attempt} failed for ${url}:`, error.message);
      
      // If this was the last attempt, log the failure but don't throw error
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed for webhook to ${url}. Continuing execution...`);
        // Don't throw error - we don't want webhook failures to break the main functionality
        return null;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      console.log(`Waiting ${delay}ms before retry ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Verify webhook signature using app-specific secret
exports.verifyWebhookSignature = async (appId, payload, signature) => {
  // Get the app to retrieve its webhook secret
  const app = await prisma.app.findUnique({
    where: { id: appId },
    select: { webhookSecret: true }
  });

  const secret = app?.webhookSecret || GLOBAL_WEBHOOK_SECRET;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
};
