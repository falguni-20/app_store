const { z } = require("zod");

exports.createAppSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  launchUrl: z.string().url("Launch URL must be a valid URL"),
  webhookUrl: z.string().url("Webhook URL must be a valid URL").optional(),
  // logoUrl is handled by file upload, not direct body input
  requiredPermissions: z.record(z.boolean()).optional(), // JSON object of booleans
});

exports.updateAppSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
  launchUrl: z.string().url("Launch URL must be a valid URL").optional().or(z.literal('')),
  webhookUrl: z.string().url("Webhook URL must be a valid URL").optional().or(z.literal('')),
  requiredPermissions: z.record(z.boolean()).optional(),
});
