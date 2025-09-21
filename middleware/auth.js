// middleware/auth.js
exports.ensureAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Unauthorized" });
};

exports.ensureRole = (roleId) => (req, res, next) => {
  if (!(req.isAuthenticated && req.isAuthenticated()))
    return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role_id !== roleId)
    return res.status(403).json({ error: "Forbidden" });
  next();
};
