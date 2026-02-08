const organizationManagementService = require("../services/organizationManagementService");
const { AppError } = require("../utils/errorHandler");

// Get all organizations (for super admins)
exports.getAllOrganizations = async (req, res, next) => {
  try {
    const organizations = await organizationManagementService.getAllOrganizations();
    res.json(organizations);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

// Create a new organization
exports.createOrganization = async (req, res, next) => {
  try {
    const { name } = req.body;
    const createdByUserId = req.user.id;

    if (!name || name.trim() === "") {
      return next(new AppError("Organization name is required.", 400));
    }

    const newOrganization = await organizationManagementService.createOrganization(name, createdByUserId);
    res.status(201).json(newOrganization);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

// Update organization
exports.updateOrganization = async (req, res, next) => {
  try {
    const orgId = parseInt(req.params.orgId, 10);
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return next(new AppError("Organization name is required.", 400));
    }

    const updatedOrganization = await organizationManagementService.updateOrganization(orgId, name);
    res.json(updatedOrganization);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

// Delete organization
exports.deleteOrganization = async (req, res, next) => {
  try {
    const orgId = parseInt(req.params.orgId, 10);

    await organizationManagementService.deleteOrganization(orgId);
    res.status(204).send(); // No content
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};