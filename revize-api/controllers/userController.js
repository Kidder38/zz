const db = require('../db');
const bcrypt = require('../utils/fakeBcrypt');
const jwt = require('../utils/jwtHelper');

// Přihlášení uživatele
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user from database
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is disabled. Contact an administrator.' });
    }

    // Verify password - pro demo účely zjednodušíme
    // Používáme fake bcrypt pro demo, v produkci by zde byl skutečný bcrypt.compare
    let isPasswordValid = false;
    
    // Jednoduché ověření v demo režimu
    if (username === 'admin' && password === 'admin123') {
      isPasswordValid = true;
    } else if (username === 'revizni.technik' && password === 'revize123') {
      isPasswordValid = true;
    } else if (username === 'technik' && password === 'technik123') {
      isPasswordValid = true;
    } else {
      // Pokud nejde o demo uživatele, zkusíme použít fake bcrypt.compare
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (e) {
        console.error('Error comparing passwords:', e);
      }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update last login timestamp
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Create token - používáme fake jwt pro demo
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role,
        // Přidáme expiraci manuálně, protože fake jwt ji nepodporuje
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hodin
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Return user info and token (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      ...userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Získat všechny uživatele
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, username, name, email, role, is_active, last_login, created_at, updated_at
      FROM users
      ORDER BY name
    `);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Získat jednoho uživatele podle ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT id, username, name, email, role, is_active, last_login, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error getting user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Vytvořit nového uživatele
exports.createUser = async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;
    
    // Validate required fields
    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'Username, password, name, and role are required' });
    }
    
    // Check if username already exists
    const checkUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password - použijeme fake bcrypt pro demo
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const result = await db.query(`
      INSERT INTO users (username, password, name, email, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, name, email, role, is_active, created_at, updated_at
    `, [username, hashedPassword, name, email, role]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Aktualizovat uživatele
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, email, role, is_active, password } = req.body;
    
    // Check if user exists
    const checkUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if username is already taken by another user
    if (username) {
      const usernameCheck = await db.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, id]);
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }
    
    // Start building the query
    let query = 'UPDATE users SET ';
    const queryParams = [];
    const queryParts = [];
    let paramCounter = 1;
    
    // Add fields to update if they are provided
    if (username) {
      queryParts.push(`username = $${paramCounter++}`);
      queryParams.push(username);
    }
    
    if (name) {
      queryParts.push(`name = $${paramCounter++}`);
      queryParams.push(name);
    }
    
    if (email !== undefined) {
      queryParts.push(`email = $${paramCounter++}`);
      queryParams.push(email);
    }
    
    if (role) {
      queryParts.push(`role = $${paramCounter++}`);
      queryParams.push(role);
    }
    
    if (is_active !== undefined) {
      queryParts.push(`is_active = $${paramCounter++}`);
      queryParams.push(is_active);
    }
    
    // If password is being updated, hash it - použijeme fake bcrypt pro demo
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      queryParts.push(`password = $${paramCounter++}`);
      queryParams.push(hashedPassword);
    }
    
    // If nothing to update, return the current user
    if (queryParts.length === 0) {
      const currentUser = await db.query(`
        SELECT id, username, name, email, role, is_active, last_login, created_at, updated_at
        FROM users WHERE id = $1
      `, [id]);
      return res.status(200).json(currentUser.rows[0]);
    }
    
    // Complete the query
    query += queryParts.join(', ');
    query += ` WHERE id = $${paramCounter} RETURNING id, username, name, email, role, is_active, last_login, created_at, updated_at`;
    queryParams.push(id);
    
    // Execute the update
    const result = await db.query(query, queryParams);
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Smazat uživatele
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const checkUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Změnit vlastní heslo
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.user; // Získáno z JWT tokenu v auth middleware
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Get user from database
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password - pro demo zjednodušené ověření
    let isPasswordValid = false;
    
    // Jednoduché ověření pro demo uživatele
    if (user.username === 'admin' && currentPassword === 'admin123') {
      isPasswordValid = true;
    } else if (user.username === 'revizni.technik' && currentPassword === 'revize123') {
      isPasswordValid = true;
    } else if (user.username === 'technik' && currentPassword === 'technik123') {
      isPasswordValid = true;
    } else {
      // Pokud nejde o demo uživatele, zkusíme použít fake bcrypt
      try {
        isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      } catch (e) {
        console.error('Error comparing passwords:', e);
      }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password - použijeme fake bcrypt pro demo
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, id]);
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Získat můj profil
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.user; // Získáno z JWT tokenu v auth middleware
    
    const result = await db.query(`
      SELECT id, username, name, email, role, is_active, last_login, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};