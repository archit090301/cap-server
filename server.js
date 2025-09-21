// server.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
require("dotenv").config();

const app = express();

// ---- CORS
const allowedOrigins = [
  "http://localhost:5173",
  // add your deployed frontend here when ready:
  // "https://editor-haov.vercel.app"
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ---- Session Store in MySQL
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000, // 15 min
  expiration: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// trust proxy (needed when behind Render/EB load balancer)
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// ---- Passport (must come BEFORE routes)
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// ---- Routes (AFTER passport)
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const fileRoutes = require("./routes/files");
const runRoutes = require("./routes/run");

app.use("/api", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", fileRoutes);
app.use("/api/run", runRoutes);

// Health check
app.get("/", (req, res) => res.json({ ok: true }));




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));
