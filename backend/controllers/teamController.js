// Team controller - handles CRUD operations with JOIN queries for related data
const pool = require('../db/connection');

// GET all teams with league and manager details
exports.getAllTeams = async (req, res) => {
  try {
    let query = `
      SELECT t.*, l.LeagueName, l.Country as LeagueCountry, m.Name as ManagerName
      FROM TEAM t
      LEFT JOIN LEAGUE l ON t.LeagueID = l.LeagueID
      LEFT JOIN MANAGER m ON t.ManagerID = m.ManagerID
    `;
    const params = [];

    // Filter by league if provided
    if (req.query.leagueId) {
      query += ' WHERE t.LeagueID = ?';
      params.push(req.query.leagueId);
    }

    query += ' ORDER BY t.TeamID';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single team by ID
exports.getTeamById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, l.LeagueName, m.Name as ManagerName
      FROM TEAM t
      LEFT JOIN LEAGUE l ON t.LeagueID = l.LeagueID
      LEFT JOIN MANAGER m ON t.ManagerID = m.ManagerID
      WHERE t.TeamID = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Team not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create new team
exports.createTeam = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { TeamName, JerseyColor, ManagerName, LeagueID } = req.body;
    if (!TeamName || !JerseyColor) {
      return res.status(400).json({ error: 'TeamName and JerseyColor are required' });
    }

    let managerId = null;
    if (ManagerName && ManagerName.trim() !== '') {
      const [mgrResult] = await conn.query('INSERT INTO MANAGER (Name) VALUES (?)', [ManagerName.trim()]);
      managerId = mgrResult.insertId;
    }

    const [result] = await conn.query(
      'INSERT INTO TEAM (TeamName, JerseyColor, ManagerID, LeagueID) VALUES (?, ?, ?, ?)',
      [TeamName, JerseyColor, managerId, LeagueID || null]
    );

    await conn.commit();
    res.status(201).json({ TeamID: result.insertId, ...req.body });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Team name already exists' });
    }
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// PUT update team
exports.updateTeam = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { TeamName, JerseyColor, ManagerName, LeagueID } = req.body;
    
    // Get current manager ID
    const [currentTeam] = await conn.query('SELECT ManagerID FROM TEAM WHERE TeamID = ?', [req.params.id]);
    if (currentTeam.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Team not found' });
    }
    
    let managerId = currentTeam[0].ManagerID;

    if (ManagerName && ManagerName.trim() !== '') {
      if (managerId) {
        // Update existing manager's name
        await conn.query('UPDATE MANAGER SET Name = ? WHERE ManagerID = ?', [ManagerName.trim(), managerId]);
      } else {
        // Insert new manager
        const [mgrResult] = await conn.query('INSERT INTO MANAGER (Name) VALUES (?)', [ManagerName.trim()]);
        managerId = mgrResult.insertId;
      }
    } else {
      // If manager name is cleared, unassign the manager
      managerId = null;
    }

    const [result] = await conn.query(
      'UPDATE TEAM SET TeamName = ?, JerseyColor = ?, ManagerID = ?, LeagueID = ? WHERE TeamID = ?',
      [TeamName, JerseyColor, managerId, LeagueID || null, req.params.id]
    );
    
    await conn.commit();
    res.json({ message: 'Team updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// DELETE team (prevent if team has matches)
exports.deleteTeam = async (req, res) => {
  try {
    const [matches] = await pool.query(
      'SELECT COUNT(*) as count FROM fixtures WHERE HomeTeamID = ? OR AwayTeamID = ?',
      [req.params.id, req.params.id]
    );
    if (matches[0].count > 0) {
      return res.status(409).json({ error: 'Cannot delete team with existing matches. Delete matches first.' });
    }
    const [result] = await pool.query('DELETE FROM TEAM WHERE TeamID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Team not found' });
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
