const crypto = require("crypto");
const axios = require("axios");
const { prisma } = require("../config/db");

const GLOBAL_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "supersecretwebhookkey";

exports.generateWebhookSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

exports.sendWebhook = async (instituteId, appId, url, payload) => {
  const maxRetries = 3;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
        timeout: 10000,
      });

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
      await prisma.webhookLog.create({
        data: {
          instituteId,
          appId,
          payload,
          statusCode: error.response?.status || 0,
        }
      });

      console.error(`Webhook attempt ${attempt} failed for ${url}:`, error.message);

      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed for webhook to ${url}. Continuing execution...`);
        return null;
      }

      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.log(`Waiting ${delay}ms before retry ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

exports.verifyWebhookSignature = async (appId, payload, signature) => {
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
