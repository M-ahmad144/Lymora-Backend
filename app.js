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
require("dotenv").config();

// Routes
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productsRoutes = require("./routes/productsRoutes");
const uploadsRoutes = require("./routes/uploadsRoutes");
const orderRoutes = require("./routes/OrderRoutes");

const app = express();
const errorMiddleware = require("./middlewares/error");

// Rate limiting setup - Add a custom limit to protect your API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middleware setup
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use(limiter);
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Trust the proxy headers
app.set("trust proxy", 1);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/orders", orderRoutes);

// PayPal configuration route
app.get("/api/config/paypal", (req, res) => {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  if (!paypalClientId) {
    return res
      .status(500)
      .json({ message: "PayPal Client ID is not configured." });
  }
  res.json({ clientId: paypalClientId });
});

// Error handling middleware should be last
app.use(errorMiddleware);

module.exports = app;
