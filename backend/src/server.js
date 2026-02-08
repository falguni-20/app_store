require("dotenv").config();
const app = require("./app");
// const { prisma, asyncLocalStorage } = require("./config/db"); // No need to import prisma here for middleware application

const PORT = process.env.PORT || 5000; // Use a default port

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
