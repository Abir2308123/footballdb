// Standings controller - retrieves league standings and dashboard statistics
const pool = require('../db/connection');

// GET standings for a specific league
exports.getStandings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, t.TeamName, t.JerseyColor, l.LeagueName
      FROM STANDINGS s
      JOIN TEAM t ON s.TeamID = t.TeamID
      JOIN LEAGUE l ON s.LeagueID = l.LeagueID
      WHERE s.LeagueID = ?
      ORDER BY s.Position ASC
    `, [req.params.leagueId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all standings (for dashboard preview)
exports.getAllStandings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, t.TeamName, t.JerseyColor, l.LeagueName
      FROM STANDINGS s
      JOIN TEAM t ON s.TeamID = t.TeamID
      JOIN LEAGUE l ON s.LeagueID = l.LeagueID
      ORDER BY s.LeagueID, s.Position ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET dashboard summary statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT COUNT(*) as count FROM TEAM');
    const [players] = await pool.query('SELECT COUNT(*) as count FROM PLAYER');
    const [matches] = await pool.query('SELECT COUNT(*) as count FROM fixtures');
    const [leagues] = await pool.query('SELECT COUNT(*) as count FROM LEAGUE');
    const [venues] = await pool.query('SELECT COUNT(*) as count FROM VENUE');
    const [managers] = await pool.query('SELECT COUNT(*) as count FROM MANAGER');
    const [freeAgents] = await pool.query('SELECT COUNT(*) as count FROM PLAYER WHERE TeamID IS NULL');

    res.json({
      teams: teams[0].count,
      players: players[0].count,
      matches: matches[0].count,
      leagues: leagues[0].count,
      venues: venues[0].count,
      managers: managers[0].count,
      freeAgents: freeAgents[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET statistics for reports page
exports.getStatistics = async (req, res) => {
  try {
    // Best teams by win percentage
    const [teamStats] = await pool.query(`
      SELECT t.TeamName, t.JerseyColor,
        s.Played, s.Wins, s.Draws, s.Losses, s.Points, s.GoalsFor, s.GoalsAgainst,
        CASE WHEN s.Played > 0 THEN ROUND((s.Wins / s.Played) * 100, 1) ELSE 0 END as WinPercentage,
        l.LeagueName
      FROM STANDINGS s
      JOIN TEAM t ON s.TeamID = t.TeamID
      JOIN LEAGUE l ON s.LeagueID = l.LeagueID
      ORDER BY WinPercentage DESC, s.Points DESC
    `);

    // Venue utilization
    const [venueStats] = await pool.query(`
      SELECT v.Name, v.City, v.Capacity, COUNT(m.MatchID) as MatchCount
      FROM VENUE v
      LEFT JOIN fixtures m ON v.VenueID = m.VenueID
      GROUP BY v.VenueID, v.Name, v.City, v.Capacity
      ORDER BY MatchCount DESC
    `);

    // Age distribution
    const [ageDistribution] = await pool.query(`
      SELECT 
        CASE 
          WHEN Age BETWEEN 16 AND 20 THEN '16-20'
          WHEN Age BETWEEN 21 AND 25 THEN '21-25'
          WHEN Age BETWEEN 26 AND 30 THEN '26-30'
          WHEN Age BETWEEN 31 AND 35 THEN '31-35'
          WHEN Age BETWEEN 36 AND 40 THEN '36-40'
          WHEN Age BETWEEN 41 AND 45 THEN '41-45'
        END as AgeGroup,
        COUNT(*) as Count
      FROM PLAYER
      GROUP BY AgeGroup
      ORDER BY AgeGroup
    `);

    // Position distribution
    const [positionDistribution] = await pool.query(`
      SELECT Position, COUNT(*) as Count
      FROM PLAYER
      GROUP BY Position
      ORDER BY Count DESC
    `);

    // Top scoring teams (by GoalsFor)
    const [topScorers] = await pool.query(`
      SELECT t.TeamName, s.GoalsFor, s.GoalsAgainst, s.Played, l.LeagueName,
        CASE WHEN s.Played > 0 THEN ROUND(s.GoalsFor / s.Played, 2) ELSE 0 END as GoalsPerGame
      FROM STANDINGS s
      JOIN TEAM t ON s.TeamID = t.TeamID
      JOIN LEAGUE l ON s.LeagueID = l.LeagueID
      WHERE s.Played > 0
      ORDER BY GoalsPerGame DESC
    `);

    res.json({
      teamStats,
      venueStats,
      ageDistribution,
      positionDistribution,
      topScorers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
