const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const appRoutes = require("./routes/appRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/apps", appRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = app;
