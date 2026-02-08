import { z } from "zod";

export const createAppSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  launchUrl: z.string().url("Launch URL must be a valid URL"),
  webhookUrl: z.string().url("Webhook URL must be a valid URL").optional().or(z.literal('')),
  description: z.string().min(1, "Description is required"),
  requiredPermissions: z.string().optional().refine((val) => {
    if (!val) return true;
    try {
      JSON.parse(val);
      return true;
    } catch (error) { // eslint-disable-line no-unused-vars
      return false;
    }
  }, "Required Permissions must be a valid JSON object"),
  logo: z.any().optional(), // File object, validation handled separately
});

export const updateAppSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    category: z.string().min(1, "Category is required").optional(),
    launchUrl: z.string().url("Launch URL must be a valid URL").optional().or(z.literal('')),
    webhookUrl: z.string().url("Webhook URL must be a valid URL").optional().or(z.literal('')),
    description: z.string().min(1, "Description is required").optional(),
    requiredPermissions: z.string().optional().refine((val) => {
      if (!val) return true;
      try {
        JSON.parse(val);
        return true;
      } catch (error) { // eslint-disable-line no-unused-vars
        return false;
      }
    }, "Required Permissions must be a valid JSON object"),
    logo: z.any().optional(), // File object, validation handled separately
  });
