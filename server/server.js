// server/server.js — HELIO Solar Grid API (Node.js + Express + MongoDB)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
// Express runs on 3001 — Python ML Flask API runs on 5000 (no conflict)
const PORT = process.env.PORT || 3001;

// ——— MIDDLEWARE ———
// Accept requests from Vite dev server (:5173), CRA (:3000), and any preview build
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:4173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
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
app.use("/api/ai", require("./routes/ai"));          // ← AI Energy Manager

// additional endpoints used for building/energy analytics
app.use("/api/buildings", require("./routes/buildings"));
app.use("/api/energy", require("./routes/energy"));

// ——— HEALTH CHECK ———
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", port: PORT, timestamp: new Date().toISOString() })
);

app.listen(PORT, () =>
  console.log(`🌞 HELIO API running on http://localhost:${PORT}`)
);
