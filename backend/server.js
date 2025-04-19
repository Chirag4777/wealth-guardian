const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./src/middleware/errorMiddleware");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS to allow all origins
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/accounts", require("./src/routes/accountRoutes"));
app.use("/api/transactions", require("./src/routes/transactionRoutes"));
app.use("/api/budgets", require("./src/routes/budgetRoutes"));
app.use("/api/goals", require("./src/routes/goalRoutes"));
app.use("/api/wallet", require("./src/routes/walletRoutes"));

// Default route
app.get("/", (req, res) => {
  res.send("Wealth Guardian API is running");
});

// Error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origin: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});
