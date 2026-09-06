const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { execFile } = require('child_process');
const authenticateToken = require('./middleware/authMiddleware');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("MySQL connected successfully!");
});

app.get("/", (req, res) => {
    res.send("Backend server is running!");
});

app.get("/api/users", (req, res) => {
    const sql = "SELECT * FROM users";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
});

app.post("/api/users", (req, res) => {
    const { name, email } = req.body;

    const sql = "INSERT INTO users (name, email) VALUES (?, ?)";

    db.query(sql, [name, email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({
            message: "User created successfully",
            id: result.insertId,
            name: name,
            email: email
        });
    });
});

app.get("/api/users/:id", (req, res) => {
    const id = req.params.id;

    const sql = "SELECT * FROM users WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(results[0]);
    });
});

app.put("/api/users/:id", (req, res) => {
    const id = req.params.id;
    const { name, email } = req.body;

    const sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";

    db.query(sql, [name, email, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            id: id,
            name: name,
            email: email
        });
    });
});

app.delete("/api/users/:id", (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User deleted successfully",
            id: id
        });
    });
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    // Check whether email already exists
    const [existingUsers] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: 'Email is required'
    });
  }

  const findUserSql = 'SELECT id, name, email FROM users WHERE email = ?';

  db.query(findUserSql, [email], (error, results) => {

    if (error) {
      console.error('Forgot password error:', error);

      return res.status(500).json({
        message: 'Server error'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Email not found'
      });
    }

    const user = results[0];

    // Generate secure reset token
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires after 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const insertTokenSql = `
      INSERT INTO password_resets
      (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `;

    db.query(
      insertTokenSql,
      [user.id, token, expiresAt],
      (error) => {

        if (error) {
          console.error('Token save error:', error);

          return res.status(500).json({
            message: 'Could not create reset token'
          });
        }

        console.log('Password reset token:', token);

        res.status(200).json({
          message: 'Password reset token generated successfully',
          token: token
        });

      }
    );

  });
});

app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      message: 'Token and password are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters'
    });
  }

  const findTokenSql = `
    SELECT user_id
    FROM password_resets
    WHERE token = ?
    AND expires_at > NOW()
  `;

  db.query(findTokenSql, [token], async (error, results) => {

    if (error) {
      console.error('Reset password error:', error);

      return res.status(500).json({
        message: 'Server error'
      });
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: 'Invalid or expired reset token'
      });
    }

    const userId = results[0].user_id;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const updatePasswordSql = `
        UPDATE users
        SET password = ?
        WHERE id = ?
      `;

      db.query(
        updatePasswordSql,
        [hashedPassword, userId],
        (error) => {

          if (error) {
            console.error('Password update error:', error);

            return res.status(500).json({
              message: 'Could not update password'
            });
          }

          const deleteTokenSql = `
            DELETE FROM password_resets
            WHERE token = ?
          `;

          db.query(deleteTokenSql, [token], (error) => {

            if (error) {
              console.error('Token deletion error:', error);
            }

            res.status(200).json({
              message: 'Password reset successfully'
            });

          });

        }
      );

    } catch (error) {
      console.error('Password hashing error:', error);

      res.status(500).json({
        message: 'Server error'
      });
    }

  });
});

app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {

    const [expenses] = await db.promise().query(
      `SELECT 
        id,
        title,
        amount,
        category,
        expense_date,
        description,
        created_at
       FROM expenses
       WHERE user_id = ?
       ORDER BY expense_date DESC`,
      [req.user.id]
    );

    res.status(200).json(expenses);

  } catch (error) {

    console.error('Get expenses error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      expense_date,
      description
    } = req.body;

    // Validate required fields
    if (!title || !amount || !category || !expense_date) {
      return res.status(400).json({
        message: 'Title, amount, category and expense date are required'
      });
    }

    // Insert expense for the logged-in user
    const [result] = await db.promise().query(
      `INSERT INTO expenses
       (user_id, title, amount, category, expense_date, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        amount,
        category,
        expense_date,
        description || null
      ]
    );

    res.status(201).json({
      message: 'Expense added successfully',
      expenseId: result.insertId
    });

  } catch (error) {
    console.error('Add expense error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      amount,
      category,
      expense_date,
      description
    } = req.body;

    if (!title || !amount || !category || !expense_date) {
      return res.status(400).json({
        message: 'Title, amount, category and expense date are required'
      });
    }

    const [result] = await db.promise().query(
      `UPDATE expenses
       SET title = ?,
           amount = ?,
           category = ?,
           expense_date = ?,
           description = ?
       WHERE id = ? AND user_id = ?`,
      [
        title,
        amount,
        category,
        expense_date,
        description || null,
        id,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      message: 'Expense updated successfully'
    });

  } catch (error) {
    console.error('Update expense error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.promise().query(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Delete expense error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// Python Data Analyst API
app.get('/api/analytics', authenticateToken, (req, res) => {

  const userId = req.user.id;

  execFile(
    'python',
    ['analyst.py', userId.toString()],
    {
      cwd: 'D:\\fullstack_project\\python-analyst'
    },
    (error, stdout, stderr) => {

      if (error) {
        console.error('Python error:', error);
        console.error('Python stderr:', stderr);

        return res.status(500).json({
          message: 'Analytics failed'
        });
      }

      console.log('Python Analytics Output:');
      console.log(stdout);

      try {
        const analysis = JSON.parse(stdout.trim());

        res.status(200).json({
          userId: userId,
          analysis: analysis
        });

      } catch (parseError) {
        console.error('JSON parse error:', parseError);

        res.status(500).json({
          message: 'Invalid analytics data from Python'
        });
      }
    }
  );
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});