// League controller - handles all CRUD operations for leagues
const pool = require('../db/connection');

// GET all leagues
exports.getAllLeagues = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM LEAGUE ORDER BY LeagueID');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single league by ID
exports.getLeagueById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM LEAGUE WHERE LeagueID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'League not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create new league
exports.createLeague = async (req, res) => {
  try {
    const { LeagueName, Country, UEFACoefficient } = req.body;
    if (!LeagueName || !Country) {
      return res.status(400).json({ error: 'LeagueName and Country are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO LEAGUE (LeagueName, Country, UEFACoefficient) VALUES (?, ?, ?)',
      [LeagueName, Country, UEFACoefficient || 0]
    );
    res.status(201).json({ LeagueID: result.insertId, LeagueName, Country, UEFACoefficient });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'League name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT update league
exports.updateLeague = async (req, res) => {
  try {
    const { LeagueName, Country, UEFACoefficient } = req.body;
    const [result] = await pool.query(
      'UPDATE LEAGUE SET LeagueName = ?, Country = ?, UEFACoefficient = ? WHERE LeagueID = ?',
      [LeagueName, Country, UEFACoefficient, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'League not found' });
    res.json({ message: 'League updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE league
exports.deleteLeague = async (req, res) => {
  try {
    // Check if league has teams
    const [teams] = await pool.query('SELECT COUNT(*) as count FROM TEAM WHERE LeagueID = ?', [req.params.id]);
    if (teams[0].count > 0) {
      return res.status(409).json({ error: 'Cannot delete league with existing teams. Remove teams first.' });
    }
    const [result] = await pool.query('DELETE FROM LEAGUE WHERE LeagueID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'League not found' });
    res.json({ message: 'League deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
