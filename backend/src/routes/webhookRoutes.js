const router = require("express").Router();
const { verifyWebhookSignature } = require("../utils/webhookSender");

router.post("/app-installed", async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const appId = req.headers["x-app-id"];
    const payload = JSON.stringify(req.body);

    if (!signature || !appId || !(await verifyWebhookSignature(Number(appId), payload, signature))) {
      return res.status(401).json({ message: "Invalid webhook signature or missing app ID" });
    }

    console.log("Received valid app installation webhook:", req.body);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
