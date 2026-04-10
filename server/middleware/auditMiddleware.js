const { pool } = require('../db');

const logAction = async (userID, actionType, actionDetails) => {
  try {
    const query = 'INSERT INTO audit_log_tbl (userID, action_type, action_details) VALUES (?, ?, ?)';
    await pool.execute(query, [userID || null, actionType, actionDetails]);
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};

const auditMiddleware = (actionType) => {
  return async (req, res, next) => {
    res.on('finish', () => {
      // Typically userID would be injected into req.user by an auth middleware. 
      // For now, we manually pass it from body.userID for POST requests, or default to null.
      const userID = req.body?.userID || null;
      const details = `Action performed: ${actionType}. Status: ${res.statusCode}`;
      logAction(userID, actionType, details);
    });
    next();
  };
};

module.exports = { logAction, auditMiddleware };
