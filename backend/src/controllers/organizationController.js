const organizationService = require("../services/organizationService");
const { AppError } = require("../utils/errorHandler");

exports.listInstitutesByOrganization = async (req, res, next) => {
  try {
    const orgIdFromParams = Number(req.params.orgId);

    // tenantAuth middleware already ensures req.orgId is correct and user has access
    // We double check here to make sure params match the tenant
    if (req.orgId !== orgIdFromParams) {
      return next(new AppError("Forbidden: Access to this organization is denied.", 403));
    }

    const institutes = await organizationService.getInstitutesByOrganization(orgIdFromParams);
    res.json(institutes);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

exports.createInstitute = async (req, res, next) => {
  try {
    const orgIdFromParams = Number(req.params.orgId);
    const { name } = req.body;
    const userId = req.user.id; // User creating the institute

    if (req.orgId !== orgIdFromParams) {
      return next(new AppError("Forbidden: Access to this organization is denied.", 403));
    }

    if (!name || name.trim() === "") {
        return next(new AppError("Institute name is required.", 400));
    }

    const newInstitute = await organizationService.createInstitute(orgIdFromParams, name, userId);
    res.status(201).json(newInstitute);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

// Get users in an organization
exports.getUsersInOrganization = async (req, res, next) => {
  try {
    const orgIdFromParams = Number(req.params.orgId);

    if (req.orgId !== orgIdFromParams) {
      return next(new AppError("Forbidden: Access to this organization is denied.", 403));
    }

    const users = await organizationService.getUsersInOrganization(orgIdFromParams);
    res.json(users);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

// Invite user to organization
exports.inviteUserToOrganization = async (req, res, next) => {
  try {
    const orgIdFromParams = Number(req.params.orgId);
    const { email, role } = req.body;
    const invitedById = req.user.id;

    if (req.orgId !== orgIdFromParams) {
      return next(new AppError("Forbidden: Access to this organization is denied.", 403));
    }

    // Validate role
    const validRoles = ['USER', 'ORG_ADMIN'];
    if (!validRoles.includes(role)) {
      return next(new AppError("Invalid role. Valid roles are: USER, ORG_ADMIN", 400));
    }

    const invitedUser = await organizationService.inviteUserToOrganization(orgIdFromParams, email, role, invitedById);
    res.status(201).json(invitedUser);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};