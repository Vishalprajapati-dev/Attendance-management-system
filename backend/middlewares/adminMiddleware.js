const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (
    req.user.role !== "admin" &&
    req.user.role !== "manager"
  ) {
    return res.status(403).json({
      success: false,
      message: "Admin or Manager access required",
    });
  }

  next();
};

module.exports = adminMiddleware;