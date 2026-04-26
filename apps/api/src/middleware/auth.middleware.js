const { verifyToken } = require("../services/auth.service");

const requireAuth = (req, res, next) => {
  try {
    req.user = verifyToken(req.headers.authorization);
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    try {
      req.user = verifyToken(req.headers.authorization);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden for this role" });
  }

  return next();
};

module.exports = {
  requireAuth,
  requireRole
};
