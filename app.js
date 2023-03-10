const express = require("express");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
// const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const productRouter = require("./routers/productRouter");
const userRouter = require("./routers/userRouter");
const cartRouter = require("./routers/cartRouter");
const errorController = require("./controllers/errorController");
const { takePayment } = require("./controllers/paymentController");

const app = express();

app.use(cors());

// Limit request limit
app.use(
  "/api",
  rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: "Request limit exhausted, only 100 calls/ hour is allowed",
  })
);

// Parse cookies
app.use(cookieParser());

// Sanitize request from manipulating mongoDB database
app.use(mongoSanitize());

// Cross site cleaning to prevent malicious html codes
app.use(xss());

// Add body to requests
app.use(
  express.json({
    limit: "10kb",
  })
);

// Routes
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/cart", cartRouter);
app.post("/api/checkout", takePayment);

// Error handler
app.use(errorController);

// Not found route
app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Path not found on server",
  });
});

module.exports = app;
