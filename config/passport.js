// config/passport.js
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("../db");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const [rows] = await pool.query(
            "SELECT user_id, username, email, password_hash, role_id, preferred_theme_id FROM users WHERE email = ?",
            [email]
          );
          if (rows.length === 0) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const user = rows[0];
          const ok = await bcrypt.compare(password, user.password_hash);
          if (!ok) {
            return done(null, false, { message: "Invalid email or password" });
          }
          // minimal user object for session
          return done(null, {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role_id: user.role_id,
            preferred_theme_id: user.preferred_theme_id,
          });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.user_id));

  passport.deserializeUser(async (id, done) => {
    try {
      const [rows] = await pool.query(
        "SELECT user_id, username, email, role_id, preferred_theme_id FROM users WHERE user_id = ?",
        [id]
      );
      if (rows.length === 0) return done(null, false);
      done(null, rows[0]);
    } catch (err) {
      done(err);
    }
  });
};
