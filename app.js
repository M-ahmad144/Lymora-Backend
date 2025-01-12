const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");

const app = express();
const errorMiddleware = require("./middlewares/error");

// Routes
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productsRoutes = require("./routes/productsRoutes");
const uploadsRoutes = require("./routes/uploadsRoutes");

// Middleware setup
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100, // Limit each IP to 100 requests per windowMs
  })
);
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// Import and use routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/uploads", uploadsRoutes);

// Error middleware
app.use(errorMiddleware);

module.exports = app;
