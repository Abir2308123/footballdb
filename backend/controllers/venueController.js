// Venue controller - handles CRUD operations for venues
const pool = require('../db/connection');

// GET all venues
exports.getAllVenues = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM VENUE ORDER BY VenueID');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single venue
exports.getVenueById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM VENUE WHERE VenueID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create new venue
exports.createVenue = async (req, res) => {
  try {
    const { Name, City, Country, Capacity } = req.body;
    if (!Name || !City || !Country) {
      return res.status(400).json({ error: 'Name, City, and Country are required' });
    }
    if (Capacity && Capacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be greater than 0' });
    }
    const [result] = await pool.query(
      'INSERT INTO VENUE (Name, City, Country, Capacity) VALUES (?, ?, ?, ?)',
      [Name, City, Country, Capacity]
    );
    res.status(201).json({ VenueID: result.insertId, ...req.body });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Venue name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT update venue
exports.updateVenue = async (req, res) => {
  try {
    const { Name, City, Country, Capacity } = req.body;
    const [result] = await pool.query(
      'UPDATE VENUE SET Name = ?, City = ?, Country = ?, Capacity = ? WHERE VenueID = ?',
      [Name, City, Country, Capacity, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json({ message: 'Venue updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE venue (check for matches)
exports.deleteVenue = async (req, res) => {
  try {
    const [matches] = await pool.query('SELECT COUNT(*) as count FROM fixtures WHERE VenueID = ?', [req.params.id]);
    if (matches[0].count > 0) {
      return res.status(409).json({ error: 'Cannot delete venue with existing matches.' });
    }
    const [result] = await pool.query('DELETE FROM VENUE WHERE VenueID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json({ message: 'Venue deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
