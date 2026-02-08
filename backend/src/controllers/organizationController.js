const organizationService = require("../services/organizationService");
const { AppError } = require("../utils/errorHandler");

exports.listAllOrganizations = async (req, res, next) => {
  try {
    const organizations = await organizationService.getAllOrganizations();
    res.json(organizations);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

exports.listInstalledAppsByOrganization = async (req, res, next) => {
  try {
    const orgIdFromParams = Number(req.params.orgId);

    if (req.orgId !== orgIdFromParams) {
      return next(new AppError("Forbidden: Access to this organization is denied.", 403));
    }

    const installedApps = await organizationService.getInstalledAppsByOrganization(orgIdFromParams);
    res.json(installedApps);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

exports.listInstitutesByOrganization = async (req, res, next) => {
  try {
    const orgIdFromParams = Number(req.params.orgId);

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
    const userId = req.user.id;

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

exports.inviteUserToOrganization = async (req, res, next) => {
  try {
    const orgIdFromParams = Number(req.params.orgId);
    const { email, role } = req.body;
    const invitedById = req.user.id;

    if (req.orgId !== orgIdFromParams) {
      return next(new AppError("Forbidden: Access to this organization is denied.", 403));
    }

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