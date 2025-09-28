const jwt = require('../utils/jwtHelper');

// Middleware pro autentizaci uživatele pomocí JWT
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware pro autorizaci uživatele podle role
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
      }

      // Kontrola, zda uživatel má požadovanou roli
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};