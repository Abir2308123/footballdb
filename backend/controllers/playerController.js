// Player controller - handles CRUD operations with team transfer support
const pool = require('../db/connection');

// GET all players with team names, supports filtering
exports.getAllPlayers = async (req, res) => {
  try {
    let query = `
      SELECT p.*, t.TeamName
      FROM PLAYER p
      LEFT JOIN TEAM t ON p.TeamID = t.TeamID
    `;
    const conditions = [];
    const params = [];

    // Filter by team
    if (req.query.teamId) {
      if (req.query.teamId === 'null') {
        conditions.push('p.TeamID IS NULL');
      } else {
        conditions.push('p.TeamID = ?');
        params.push(req.query.teamId);
      }
    }

    // Filter by position
    if (req.query.position) {
      conditions.push('p.Position = ?');
      params.push(req.query.position);
    }

    // Search by name
    if (req.query.search) {
      conditions.push('p.Name LIKE ?');
      params.push(`%${req.query.search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.PlayerID';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single player
exports.getPlayerById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, t.TeamName
      FROM PLAYER p
      LEFT JOIN TEAM t ON p.TeamID = t.TeamID
      WHERE p.PlayerID = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Player not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create new player
exports.createPlayer = async (req, res) => {
  try {
    const { Name, Age, Position, JerseyNo, TeamID } = req.body;
    if (!Name || !Position) {
      return res.status(400).json({ error: 'Name and Position are required' });
    }
    if (Age < 16 || Age > 45) {
      return res.status(400).json({ error: 'Age must be between 16 and 45' });
    }
    if (JerseyNo < 1 || JerseyNo > 99) {
      return res.status(400).json({ error: 'Jersey number must be between 1 and 99' });
    }

    const [result] = await pool.query(
      'INSERT INTO PLAYER (Name, Age, Position, JerseyNo, TeamID) VALUES (?, ?, ?, ?, ?)',
      [Name, Age, Position, JerseyNo, TeamID || null]
    );
    res.status(201).json({ PlayerID: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update player (including team transfer)
exports.updatePlayer = async (req, res) => {
  try {
    const { Name, Age, Position, JerseyNo, TeamID } = req.body;
    if (Age && (Age < 16 || Age > 45)) {
      return res.status(400).json({ error: 'Age must be between 16 and 45' });
    }
    if (JerseyNo && (JerseyNo < 1 || JerseyNo > 99)) {
      return res.status(400).json({ error: 'Jersey number must be between 1 and 99' });
    }

    const [result] = await pool.query(
      'UPDATE PLAYER SET Name = ?, Age = ?, Position = ?, JerseyNo = ?, TeamID = ? WHERE PlayerID = ?',
      [Name, Age, Position, JerseyNo, TeamID === '' || TeamID === undefined ? null : TeamID, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Player not found' });
    res.json({ message: 'Player updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE player
exports.deletePlayer = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM PLAYER WHERE PlayerID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Player not found' });
    res.json({ message: 'Player deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
