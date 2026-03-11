// server/index.js — HELIO Solar Grid API (Node.js + Express + MongoDB)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ——— MIDDLEWARE ———
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// ——— MONGODB CONNECTION ———
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/helio_solar", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ——— ROUTES ———
app.use("/api/grid", require("./routes/grid"));
app.use("/api/weather", require("./routes/weather"));
app.use("/api/revenue", require("./routes/revenue"));
app.use("/api/panels", require("./routes/panels"));
app.use("/api/estimation", require("./routes/estimation"));
app.use("/api/dna", require("./routes/dna"));

// additional endpoints used for building/energy analytics
app.use("/api/buildings", require("./routes/buildings"));
app.use("/api/energy", require("./routes/energy"));

// ——— HEALTH CHECK ———
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

app.listen(PORT, () =>
  console.log(`🌞 VIT-Charge API running on http://localhost:${PORT}`),
);
