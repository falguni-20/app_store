const appService = require("../services/adminAppService");
const { AppError } = require("../utils/errorHandler");

// List all apps (Admin view)
exports.listAllApps = async (req, res, next) => {
  try {

    const apps = await appService.listAllApps();
    res.json(apps);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// Create app
exports.createApp = async (req, res, next) => {
  try {
    // Include logo URL if a file was uploaded
    const data = { ...req.body };
    if (req.file) {
      data.logoUrl = `/uploads/${req.file.filename}`; // Store the path to the uploaded file
      console.log(`Logo uploaded: ${data.logoUrl}`); // Debug log
    } else {
      console.log('No logo file uploaded'); // Debug log
    }
    
    const app = await appService.createApp(data);
    res.status(201).json(app);
  } catch (err) {
    console.error('Error creating app:', err); // Debug log
    next(new AppError(err.message, 400));
  }
};

// Update app
exports.updateApp = async (req, res, next) => {
  try {
    // Include logo URL if a file was uploaded
    const data = { ...req.body };
    if (req.file) {
      data.logoUrl = `/uploads/${req.file.filename}`; // Update with new logo if uploaded
      console.log(`Logo updated: ${data.logoUrl}`); // Debug log
    } else {
      console.log('No new logo file uploaded, keeping existing'); // Debug log
    }
    
    const app = await appService.updateApp(Number(req.params.id), data);
    res.json(app);
  } catch (err) {
    console.error('Error updating app:', err); // Debug log
    next(new AppError(err.message, 400));
  }
};

// Delete app
exports.deleteApp = async (req, res, next) => {
  try {
    await appService.deleteApp(Number(req.params.id));
    res.json({ message: "App deleted successfully" });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
