
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const UserModel = require("./model/UserModel");

const app = express();
const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(cors());
app.use(express.json());

// Health check: useful for checking whether the backend is running
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Zerodha backend is running",
  });
});

// Get all holdings
app.get("/allHoldings", async (req, res) => {
  try {
    const holdings = await HoldingsModel.find({});
    res.status(200).json(holdings);
  } catch (error) {
    console.error("Error fetching holdings:", error.message);
    res.status(500).json({ message: "Server error fetching holdings" });
  }
});

// Get all positions
app.get("/allPositions", async (req, res) => {
  try {
    const positions = await PositionsModel.find({});
    res.status(200).json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error.message);
    res.status(500).json({ message: "Server error fetching positions" });
  }
});

// Get all orders
app.get("/allOrders", async (req, res) => {
  try {
    const orders = await OrdersModel.find({});
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// Create a new order
app.post("/newOrder", async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;

    if (
      !name ||
      !Number.isFinite(Number(qty)) ||
      Number(qty) <= 0 ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      !["BUY", "SELL"].includes(mode)
    ) {
      return res.status(400).json({
        message: "Invalid order details",
      });
    }

    const order = new OrdersModel({
      name,
      qty,
      price,
      mode,
    });

    await order.save();

    return res.status(201).json({
      message: "Order saved successfully",
      order,
    });
  } catch (error) {
    console.error("Error saving order:", error.message);
    return res.status(500).json({
      message: "Server error saving order",
    });
  }
});

// Register a user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Enter your name, a valid email, and a password of at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new UserModel({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account already exists with this email",
      });
    }

    return res.status(500).json({
      message: "Server error during registration",
    });
  }
});

// Login a user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await UserModel.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      userId: user.id,
      name: user.name,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
});

// Connect to MongoDB, then start the server
async function startServer() {
  if (!MONGO_URL) {
    console.error("MONGO_URL environment variable is missing");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

startServer();
