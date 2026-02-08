const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const appRoutes = require("./routes/appRoutes");
const adminAppRoutes = require("./routes/adminAppRoutes");
const viewAppsRoutes = require("./routes/viewAppsRoutes");
const instituteAppRoutes = require("./routes/instituteAppRoutes");
const appAnalyticsRoutes = require("./routes/appAnalyticsRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const organizationManagementRoutes = require("./routes/organizationManagementRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const scopeTenant = require("./middlewares/scopeTenant");
const { globalErrorHandler } = require("./utils/errorHandler");

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, '../public')));
app.use(scopeTenant);

app.use("/auth", authRoutes);
app.use("/apps", appRoutes);
app.use("/admin/apps", adminAppRoutes);
app.use("/view/apps", viewAppsRoutes);
app.use("/institute/apps", instituteAppRoutes);
app.use("/analytics/apps", appAnalyticsRoutes);
app.use("/organizations", organizationRoutes);
app.use("/organization-management", organizationManagementRoutes);
app.use("/webhooks", webhookRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use(globalErrorHandler);

module.exports = app;
