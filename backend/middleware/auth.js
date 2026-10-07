const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      msg: 'No authorization token provided' 
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET,
    (err, decoded) => {
      if (err) {
        console.error('JWT Verification Error:', err.message);
        
        let errorMsg = 'Invalid token';
        if (err.name === 'TokenExpiredError') errorMsg = 'Token expired';
        if (err.name === 'JsonWebTokenError') errorMsg = 'Malformed token';

        return res.status(403).json({ 
          success: false,
          msg: errorMsg 
        });
      }

      req.user = decoded; 
      next();
    }
  );
};

module.exports = auth;