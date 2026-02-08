const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const appRoutes = require("./routes/appRoutes");
const adminAppRoutes = require("./routes/adminAppRoutes");
const viewAppsRoutes = require("./routes/viewAppsRoutes"); // New import
const instituteAppRoutes = require("./routes/instituteAppRoutes");
const appAnalyticsRoutes = require("./routes/appAnalyticsRoutes"); // New import
const organizationRoutes = require("./routes/organizationRoutes"); // New import
const organizationManagementRoutes = require("./routes/organizationManagementRoutes"); // New import
const webhookRoutes = require("./routes/webhookRoutes");
const scopeTenant = require("./middlewares/scopeTenant");
const { globalErrorHandler } = require("./utils/errorHandler"); // Import global error handler

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

console.log('Static file path:', path.join(__dirname, '../public')); // Debug log - go up one level to reach backend/public
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from the 'public' directory (go up one level)
app.use(scopeTenant); // Add tenant scoping middleware

app.use("/auth", authRoutes);
app.use("/apps", appRoutes);
app.use("/admin/apps", adminAppRoutes);
app.use("/view/apps", viewAppsRoutes); // New route registration
app.use("/institute/apps", instituteAppRoutes);
app.use("/analytics/apps", appAnalyticsRoutes); // New route registration
app.use("/organizations", organizationRoutes); // New route registration
app.use("/organization-management", organizationManagementRoutes); // New route registration
app.use("/webhooks", webhookRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use(globalErrorHandler); // Add global error handler as the last middleware

module.exports = app;
