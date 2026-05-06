const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { pool } = require('./db');
const { logAction, auditMiddleware } = require('./middleware/auditMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Database Tables
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_requests_tbl (
        requestID INT AUTO_INCREMENT PRIMARY KEY,
        userID INT NOT NULL,
        new_password_hash VARCHAR(255) NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users_tbl(userID) ON DELETE CASCADE
      )
    `);
    console.log("Database tables initialized");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
};
initDB();

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

  try {
    const [rows] = await pool.query("SELECT * FROM users_tbl WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    // Success, don't send back password
    delete user.password;
    logAction(user.userID, 'LOGIN', 'User logged in successfully');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/signup', async (req, res) => {
  const { fullname, email, password } = req.body;
  if (!fullname || !email || !password) return res.status(400).json({ error: "Missing required fields" });

  if (fullname.length > 255) return res.status(400).json({ error: "Full name must not exceed 255 characters" });
  if (!/^[a-zA-Z\sÑñ]+$/.test(fullname)) return res.status(400).json({ error: "Special characters and numbers are not allowed in Full Name" });
  
  if (!email.toLowerCase().endsWith('@smu.edu.ph')) {
    return res.status(400).json({ error: "Registration is restricted to @smu.edu.ph emails" });
  }

  // Validate password pattern
  const passwordRequirements = /(?=.*[A-Z])(?=.*\d)/;
  if (!passwordRequirements.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one uppercase letter and numbers" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users_tbl (fullname, email, password, role) VALUES (?, ?, ?, 'student')",
      [fullname, email, hashedPassword]
    );

    // Automatically log this 
    logAction(result.insertId, 'SIGNUP', 'New student registered via portal');
    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  if (!email.toLowerCase().endsWith('@smu.edu.ph')) {
    return res.status(400).json({ error: "Please use your SMU email address (@smu.edu.ph)" });
  }

  // Validate password pattern
  const passwordRequirements = /(?=.*[A-Z])(?=.*\d)/;
  if (!passwordRequirements.test(newPassword)) {
    return res.status(400).json({ error: "Password must contain at least one uppercase letter and numbers" });
  }

  try {
    // Check if user exists
    const [rows] = await pool.query("SELECT userID FROM users_tbl WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User with this email does not exist" });
    }

    const userID = rows[0].userID;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Instead of updating users_tbl directly, insert into requests table
    // First, clear any existing pending requests for this user
    await pool.query("DELETE FROM password_reset_requests_tbl WHERE userID = ? AND status = 'Pending'", [userID]);
    
    await pool.query(
      "INSERT INTO password_reset_requests_tbl (userID, new_password_hash) VALUES (?, ?)",
      [userID, hashedPassword]
    );

    logAction(userID, 'PASSWORD_RESET_REQUEST', 'User submitted a password reset request');
    res.json({ message: "Request submitted! Please wait for admin/staff approval before you can use your new password." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- New Routes for Staff Approval ---

app.get('/api/password-reset-requests', async (req, res) => {
  try {
    const query = `
      SELECT pr.requestID, pr.request_date, u.fullname, u.email 
      FROM password_reset_requests_tbl pr
      JOIN users_tbl u ON pr.userID = u.userID
      WHERE pr.status = 'Pending'
      ORDER BY pr.request_date DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/password-reset-requests/:requestID/approve', auditMiddleware('APPROVE_PASSWORD_RESET'), async (req, res) => {
  const { requestID } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get the request details
    const [reqRows] = await connection.query("SELECT userID, new_password_hash FROM password_reset_requests_tbl WHERE requestID = ?", [requestID]);
    if (reqRows.length === 0) throw new Error("Request not found");

    const { userID, new_password_hash } = reqRows[0];

    // 2. Update the user's password
    await connection.query("UPDATE users_tbl SET password = ? WHERE userID = ?", [new_password_hash, userID]);

    // 3. Mark request as approved
    await connection.query("UPDATE password_reset_requests_tbl SET status = 'Approved' WHERE requestID = ?", [requestID]);

    await connection.commit();
    res.json({ message: "Password reset approved and updated successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.post('/api/password-reset-requests/:requestID/reject', auditMiddleware('REJECT_PASSWORD_RESET'), async (req, res) => {
  const { requestID } = req.params;
  try {
    await pool.query("UPDATE password_reset_requests_tbl SET status = 'Rejected' WHERE requestID = ?", [requestID]);
    res.json({ message: "Password reset request rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// EQUIPMENT & BORROWING
// ----------------------------------------------------

app.get('/api/equipment', async (req, res) => {
  try {
    // Join equipment_tbl with rental_items_tbl to find specific physically available items
    const query = `
      SELECT e.equipmentID, e.equipment_name, e.description, c.category_name, COALESCE(r.itemID, e.equipmentID) AS itemID, COALESCE(r.available_quantity, 1) AS available_quantity, COALESCE(r.total_quantity, 1) AS total_quantity,
      COALESCE((SELECT condition_status FROM rentals_tbl rt WHERE rt.itemID = r.itemID ORDER BY request_date DESC LIMIT 1), 'New') AS condition_status
      FROM equipment_tbl e
      LEFT JOIN rental_items_tbl r ON e.equipmentID = r.equipmentID
      LEFT JOIN equipment_category_tbl c ON e.categoryID = c.categoryID
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/equipment', auditMiddleware('ADD_EQUIPMENT'), async (req, res) => {
  const { equipment_name, categoryID, description, total_quantity } = req.body;
  if (!equipment_name || !categoryID) return res.status(400).json({ error: "Missing required fields" });

  const quantity = parseInt(total_quantity) || 10;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert into equipment_tbl
    const [eqResult] = await connection.query(
      "INSERT INTO equipment_tbl (categoryID, equipment_name, description) VALUES (?, ?, ?)",
      [categoryID, equipment_name, description || null]
    );
    const newEquipmentID = eqResult.insertId;

    // Immediately insert into rental_items_tbl to sync inventory tracking accurately!
    await connection.query(
      "INSERT INTO rental_items_tbl (equipmentID, total_quantity, available_quantity) VALUES (?, ?, ?)",
      [newEquipmentID, quantity, quantity]
    );

    // Provide logging correctly using implicit userID if transmitted

    await connection.commit();
    res.status(201).json({ message: "Equipment added successfully", equipmentID: newEquipmentID });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.post('/api/borrow', auditMiddleware('BORROW_EQUIPMENT'), async (req, res) => {
  const { userID, itemID, dueDate } = req.body;

  if (!userID || !itemID || !dueDate) {
    return res.status(400).json({ error: "Missing required fields (userID, itemID, dueDate)" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetDate;
  if (dueDate.includes('-')) {
    const [year, month, day] = dueDate.split('-');
    targetDate = new Date(year, month - 1, day);
  } else {
    targetDate = new Date(dueDate);
  }

  if (targetDate < today) {
    return res.status(400).json({ error: "Return date cannot be in the past" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if the item is still available
    const [itemRows] = await connection.query("SELECT available_quantity FROM rental_items_tbl WHERE itemID = ? FOR UPDATE", [itemID]);
    if (itemRows.length === 0 || itemRows[0].available_quantity < 1) {
      throw new Error("Item is no longer available");
    }

    // Insert into rentals_tbl
    const [rentalResult] = await connection.query(
      "INSERT INTO rentals_tbl (itemID, userID, quantity, borrow_status, due_date) VALUES (?, ?, ?, ?, ?)",
      [itemID, userID, 1, 'Pending', dueDate]
    );

    // Decrement availability
    await connection.query(
      "UPDATE rental_items_tbl SET available_quantity = available_quantity - 1 WHERE itemID = ?",
      [itemID]
    );

    await connection.commit();
    res.status(201).json({ message: "Borrow request submitted successfully", rentalID: rentalResult.insertId });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});


// ----------------------------------------------------
// STAFF QUERIES
// ----------------------------------------------------

app.get('/api/rentals', async (req, res) => {
  try {
    const query = `
      SELECT r.rentalID, 
             CASE 
                WHEN r.borrow_status = 'Approved' AND r.due_date < CURDATE() THEN 'Overdue'
                ELSE r.borrow_status 
             END as borrow_status,
             r.request_date, r.due_date, r.return_date, u.fullname as student_name, e.equipment_name, r.condition_status
      FROM rentals_tbl r
      LEFT JOIN users_tbl u ON r.userID = u.userID
      LEFT JOIN rental_items_tbl ri ON r.itemID = ri.itemID
      LEFT JOIN equipment_tbl e ON ri.equipmentID = e.equipmentID
      ORDER BY r.request_date DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rentals/:rentalID/status', auditMiddleware('UPDATE_RENTAL_STATUS'), async (req, res) => {
  const { rentalID } = req.params;
  const { status, userID, condition_status } = req.body;
  if (!status) return res.status(400).json({ error: "Missing status" });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rentalRows] = await connection.query("SELECT itemID, borrow_status FROM rentals_tbl WHERE rentalID = ? FOR UPDATE", [rentalID]);
    if (rentalRows.length === 0) throw new Error("Rental not found");

    const currentStatus = rentalRows[0].borrow_status;
    const itemID = rentalRows[0].itemID;

    let updateQuery = "UPDATE rentals_tbl SET borrow_status = ?";
    let queryParams = [status];

    if (status === 'Returned') {
      updateQuery += ", return_date = NOW()";
    }

    if (condition_status) {
      updateQuery += ", condition_status = ?";
      queryParams.push(condition_status);
    }

    updateQuery += " WHERE rentalID = ?";
    queryParams.push(rentalID);

    await connection.query(updateQuery, queryParams);


    if ((currentStatus === 'Pending' || currentStatus === 'Approved') && (status === 'Returned' || status === 'Rejected' || status === 'Cancelled')) {
      if (itemID) {
        await connection.query("UPDATE rental_items_tbl SET available_quantity = available_quantity + 1 WHERE itemID = ?", [itemID]);
      }
    }

    await connection.commit();
    res.json({ message: "Status updated successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.put('/api/equipment/:itemID/quantity', auditMiddleware('UPDATE_EQUIPMENT_QUANTITY'), async (req, res) => {
  const { itemID } = req.params;
  const { total_quantity } = req.body;
  
  if (total_quantity === undefined || total_quantity < 0) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT total_quantity, available_quantity FROM rental_items_tbl WHERE itemID = ?",
      [itemID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const currentTotal = rows[0].total_quantity || 0;
    const currentAvailable = rows[0].available_quantity || 0;
    const borrowed = currentTotal - currentAvailable;

    if (total_quantity < borrowed) {
      return res.status(400).json({ error: "Total quantity cannot be less than currently borrowed quantity" });
    }

    const delta = total_quantity - currentTotal;
    const newAvailable = currentAvailable + delta;

    await pool.query(
      "UPDATE rental_items_tbl SET total_quantity = ?, available_quantity = ? WHERE itemID = ?",
      [total_quantity, newAvailable, itemID]
    );

    res.json({ message: "Equipment quantity updated successfully", total_quantity, available_quantity: newAvailable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rentals/:userID', async (req, res) => {
  try {
    const query = `
      SELECT r.rentalID, 
             CASE 
                WHEN r.borrow_status = 'Approved' AND r.due_date < CURDATE() THEN 'Overdue'
                ELSE r.borrow_status 
             END as borrow_status,
             r.request_date, r.due_date, r.return_date, e.equipment_name, r.condition_status
      FROM rentals_tbl r
      LEFT JOIN rental_items_tbl ri ON r.itemID = ri.itemID
      LEFT JOIN equipment_tbl e ON ri.equipmentID = e.equipmentID
      WHERE r.userID = ?
      ORDER BY r.request_date DESC
    `;
    const [rows] = await pool.query(query, [req.params.userID]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rentals/:rentalID/cancel', async (req, res) => {
  const { rentalID } = req.params;
  const { userID } = req.body;

  if (!userID) return res.status(400).json({ error: "Missing userID" });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // 1. Verify ownership and status
    const [rows] = await connection.query(
      "SELECT itemID, borrow_status, userID FROM rentals_tbl WHERE rentalID = ? FOR UPDATE", 
      [rentalID]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Rental not found" });
    
    // Security check: only the student who requested it can cancel it here
    if (rows[0].userID !== parseInt(userID)) {
       return res.status(403).json({ error: "Unauthorized: You can only cancel your own requests" });
    }
    
    const currentStatus = rows[0].borrow_status;
    if (currentStatus !== 'Pending' && currentStatus !== 'Approved') {
       return res.status(400).json({ error: `Cannot cancel a request that is already ${currentStatus}` });
    }

    // 2. Update status
    await connection.query("UPDATE rentals_tbl SET borrow_status = 'Cancelled' WHERE rentalID = ?", [rentalID]);

    // 3. Return item to available inventory
    if (rows[0].itemID) {
      await connection.query(
        "UPDATE rental_items_tbl SET available_quantity = available_quantity + 1 WHERE itemID = ?", 
        [rows[0].itemID]
      );
    }

    await connection.commit();
    
    // Log the cancellation
    logAction(userID, 'CANCEL_BORROW', `Student cancelled borrow request for rental ID ${rentalID}`);
    
    res.json({ message: "Request cancelled successfully", rentalID });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.get('/api/audit-logs', async (req, res) => {
  try {
    const query = `
      SELECT a.logID, a.action_type, a.action_details, a.timestamp, u.fullname 
      FROM audit_log_tbl a
      LEFT JOIN users_tbl u ON a.userID = u.userID
      ORDER BY a.timestamp DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 1337;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
