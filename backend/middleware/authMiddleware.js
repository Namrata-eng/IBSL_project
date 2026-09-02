// TEMPORARY STUB — replace with your teammate's real authentication middleware.
// Once they hand off their auth system, delete this file and update the
// imports in the route files to point to theirs (keep the same export names
// `protect` and `isAdmin` and nothing else needs to change).

exports.protect = (req, res, next) => {
  // Real version should verify a JWT/session and attach req.user
  console.warn(
    "[authMiddleware] Using placeholder 'protect' — replace with real auth."
  );
  next();
};

exports.isAdmin = (req, res, next) => {
  // Real version should check req.user.role === "admin"
  console.warn(
    "[authMiddleware] Using placeholder 'isAdmin' — replace with real auth."
  );
  next();
};
