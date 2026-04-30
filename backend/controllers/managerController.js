// Manager controller - handles CRUD operations for managers
const pool = require('../db/connection');

// GET all managers with team names
exports.getAllManagers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, t.TeamID as TeamID, t.TeamName
      FROM MANAGER m
      LEFT JOIN TEAM t ON t.ManagerID = m.ManagerID
      ORDER BY m.ManagerID
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single manager
exports.getManagerById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, t.TeamID as TeamID, t.TeamName
      FROM MANAGER m
      LEFT JOIN TEAM t ON t.ManagerID = m.ManagerID
      WHERE m.ManagerID = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Manager not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create new manager
exports.createManager = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { Name, TeamID } = req.body;
    if (!Name) {
      return res.status(400).json({ error: 'Manager name is required' });
    }
    
    const [result] = await conn.query('INSERT INTO MANAGER (Name) VALUES (?)', [Name]);
    const managerId = result.insertId;

    if (TeamID) {
      await conn.query('UPDATE TEAM SET ManagerID = ? WHERE TeamID = ?', [managerId, TeamID]);
    }

    await conn.commit();
    res.status(201).json({ ManagerID: managerId, Name, TeamID });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// PUT update manager
exports.updateManager = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { Name, TeamID } = req.body;
    
    // Update manager name
    await conn.query('UPDATE MANAGER SET Name = ? WHERE ManagerID = ?', [Name, req.params.id]);

    // Update Team assignments: first set ManagerID to NULL for any team currently having this manager
    await conn.query('UPDATE TEAM SET ManagerID = NULL WHERE ManagerID = ?', [req.params.id]);
    
    // Then set the new Team's ManagerID to this manager (if a team is selected)
    if (TeamID) {
      await conn.query('UPDATE TEAM SET ManagerID = ? WHERE TeamID = ?', [req.params.id, TeamID]);
    }

    await conn.commit();
    res.json({ message: 'Manager updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// DELETE manager
exports.deleteManager = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM MANAGER WHERE ManagerID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Manager not found' });
    res.json({ message: 'Manager deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
