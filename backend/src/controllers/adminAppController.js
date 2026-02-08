const appService = require("../services/adminAppService");
const { AppError } = require("../utils/errorHandler");

exports.listAllApps = async (req, res, next) => {
  try {

    const apps = await appService.listAllApps();
    res.json(apps);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.createApp = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.logoUrl = `/uploads/${req.file.filename}`;
      console.log(`Logo uploaded: ${data.logoUrl}`);
    } else {
      console.log('No logo file uploaded');
    }

    const app = await appService.createApp(data);
    res.status(201).json(app);
  } catch (err) {
    console.error('Error creating app:', err);
    next(new AppError(err.message, 400));
  }
};

exports.updateApp = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.logoUrl = `/uploads/${req.file.filename}`;
      console.log(`Logo updated: ${data.logoUrl}`);
    } else {
      console.log('No new logo file uploaded, keeping existing');
    }

    const app = await appService.updateApp(Number(req.params.id), data);
    res.json(app);
  } catch (err) {
    console.error('Error updating app:', err);
    next(new AppError(err.message, 400));
  }
};

exports.deleteApp = async (req, res, next) => {
  try {
    await appService.deleteApp(Number(req.params.id));
    res.json({ message: "App deleted successfully" });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
