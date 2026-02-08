const router = require("express").Router();
const { verifyWebhookSignature } = require("../utils/webhookSender");

// This endpoint would typically be exposed publicly
// NOTE: This is a generic endpoint. In a real implementation, you'd have specific endpoints
// per app or use other identification methods to determine which app the webhook is for
router.post("/app-installed", async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const appId = req.headers["x-app-id"]; // Assuming app ID is passed in headers
    const payload = JSON.stringify(req.body);

    if (!signature || !appId || !(await verifyWebhookSignature(Number(appId), payload, signature))) {
      return res.status(401).json({ message: "Invalid webhook signature or missing app ID" });
    }

    // Webhook is valid, process the event
    console.log("Received valid app installation webhook:", req.body);

    // TODO: Add actual business logic here, e.g., update external system

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
