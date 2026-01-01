const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and attach user to req
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
    req.user = user;
    console.log(req.user);
    next();
  });
}

// Middleware to restrict access based on roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Forbidden: Role not found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(req.user);
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }

    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };