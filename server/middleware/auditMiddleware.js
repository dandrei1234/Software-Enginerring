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
      const userID = req.body?.userID || null;
      const details = `Action performed: ${actionType}. Status: ${res.statusCode}`;
      logAction(userID, actionType, details);
    });
    next();
  };
};

module.exports = { logAction, auditMiddleware };
