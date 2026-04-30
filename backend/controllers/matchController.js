// Match controller - handles scheduling, result recording, and auto winner determination
// Uses 'fixtures' table (your existing DB table name)
const pool = require('../db/connection');

// GET all matches with team, venue, and league names
exports.getAllMatches = async (req, res) => {
  try {
    let query = `
      SELECT m.*, 
        ht.TeamName as HomeTeamName, at.TeamName as AwayTeamName,
        v.Name as VenueName, v.City as VenueCity,
        l.LeagueName
      FROM fixtures m
      LEFT JOIN team ht ON m.HomeTeamID = ht.TeamID
      LEFT JOIN team at ON m.AwayTeamID = at.TeamID
      LEFT JOIN venue v ON m.VenueID = v.VenueID
      LEFT JOIN league l ON m.LeagueID = l.LeagueID
    `;
    const conditions = [];
    const params = [];

    // Filter by league
    if (req.query.leagueId) {
      conditions.push('m.LeagueID = ?');
      params.push(req.query.leagueId);
    }

    // Filter by date range
    if (req.query.startDate) {
      conditions.push('m.Date >= ?');
      params.push(req.query.startDate);
    }
    if (req.query.endDate) {
      conditions.push('m.Date <= ?');
      params.push(req.query.endDate);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY m.Date DESC, m.Time DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET recent matches (for dashboard)
exports.getRecentMatches = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const [rows] = await pool.query(`
      SELECT m.*, 
        ht.TeamName as HomeTeamName, at.TeamName as AwayTeamName,
        v.Name as VenueName, l.LeagueName
      FROM fixtures m
      LEFT JOIN team ht ON m.HomeTeamID = ht.TeamID
      LEFT JOIN team at ON m.AwayTeamID = at.TeamID
      LEFT JOIN venue v ON m.VenueID = v.VenueID
      LEFT JOIN league l ON m.LeagueID = l.LeagueID
      ORDER BY m.Date DESC, m.Time DESC
      LIMIT ?
    `, [parseInt(limit)]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST schedule new match
exports.createMatch = async (req, res) => {
  try {
    const { Date: matchDate, Time, Referee, HomeTeamID, AwayTeamID, LeagueID } = req.body;
    if (!matchDate || !Time || !Referee || !HomeTeamID || !AwayTeamID) {
      return res.status(400).json({ error: 'Date, Time, Referee, HomeTeamID, and AwayTeamID are required' });
    }
    if (HomeTeamID === AwayTeamID) {
      return res.status(400).json({ error: 'Home team and away team cannot be the same' });
    }

    // Auto-determine Venue from Home Team
    const [teamInfo] = await pool.query('SELECT VenueID FROM team WHERE TeamID = ?', [HomeTeamID]);
    const VenueID = teamInfo[0]?.VenueID || null;

    const [result] = await pool.query(
      'INSERT INTO fixtures (Date, Time, Referee, HomeTeamID, AwayTeamID, VenueID, LeagueID) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [matchDate, Time, Referee, HomeTeamID, AwayTeamID, VenueID, LeagueID || null]
    );
    res.status(201).json({ MatchID: result.insertId, ...req.body, VenueID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update match result - auto determines winner and updates standings
exports.updateMatch = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { HomeGoals, AwayGoals, Date: matchDate, Time, Referee, HomeTeamID, AwayTeamID, LeagueID } = req.body;

    // Get current match data
    const [currentMatch] = await conn.query('SELECT * FROM fixtures WHERE MatchID = ?', [req.params.id]);
    if (currentMatch.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = currentMatch[0];
    const homeGoals = HomeGoals !== undefined ? parseInt(HomeGoals) : match.HomeGoals;
    const awayGoals = AwayGoals !== undefined ? parseInt(AwayGoals) : match.AwayGoals;
    const homeTeamId = HomeTeamID || match.HomeTeamID;
    const awayTeamId = AwayTeamID || match.AwayTeamID;
    const leagueId = LeagueID || match.LeagueID;

    // Auto-determine Venue from Home Team
    const [teamInfo] = await conn.query('SELECT VenueID FROM team WHERE TeamID = ?', [homeTeamId]);
    const VenueID = teamInfo[0]?.VenueID || null;

    // Automatically determine winner
    let winner = 'Draw';
    if (homeGoals > awayGoals) {
      const [homeTeam] = await conn.query('SELECT TeamName FROM team WHERE TeamID = ?', [homeTeamId]);
      winner = homeTeam[0]?.TeamName || 'Home';
    } else if (awayGoals > homeGoals) {
      const [awayTeam] = await conn.query('SELECT TeamName FROM team WHERE TeamID = ?', [awayTeamId]);
      winner = awayTeam[0]?.TeamName || 'Away';
    }

    // Update the match
    await conn.query(
      `UPDATE fixtures SET HomeGoals = ?, AwayGoals = ?, Winner = ?, 
       Date = COALESCE(?, Date), Time = COALESCE(?, Time), 
       Referee = COALESCE(?, Referee), HomeTeamID = ?, AwayTeamID = ?,
       VenueID = ?, LeagueID = COALESCE(?, LeagueID)
       WHERE MatchID = ?`,
      [homeGoals, awayGoals, winner, matchDate, Time, Referee, homeTeamId, awayTeamId, VenueID, LeagueID, req.params.id]
    );

    // Recalculate standings for the league if results were updated
    if (leagueId && (HomeGoals !== undefined || AwayGoals !== undefined)) {
      await recalculateStandings(conn, leagueId);
    }

    await conn.commit();
    res.json({ message: 'Match updated successfully', winner });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// DELETE match
exports.deleteMatch = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Get match's league before deleting
    const [match] = await conn.query('SELECT LeagueID FROM fixtures WHERE MatchID = ?', [req.params.id]);
    if (match.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Match not found' });
    }

    const leagueId = match[0].LeagueID;
    await conn.query('DELETE FROM fixtures WHERE MatchID = ?', [req.params.id]);

    // Recalculate standings after deletion
    if (leagueId) {
      await recalculateStandings(conn, leagueId);
    }

    await conn.commit();
    res.json({ message: 'Match deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// Helper: Recalculate standings for a league based on match results
async function recalculateStandings(conn, leagueId) {
  // Get all teams in the league
  const [teams] = await conn.query('SELECT TeamID FROM team WHERE LeagueID = ?', [leagueId]);

  for (const team of teams) {
    // Calculate stats from match results
    const [stats] = await conn.query(`
      SELECT 
        COUNT(*) as Played,
        SUM(CASE 
          WHEN (HomeTeamID = ? AND HomeGoals > AwayGoals) OR (AwayTeamID = ? AND AwayGoals > HomeGoals) THEN 1 
          ELSE 0 END) as Wins,
        SUM(CASE WHEN HomeGoals = AwayGoals THEN 1 ELSE 0 END) as Draws,
        SUM(CASE 
          WHEN (HomeTeamID = ? AND HomeGoals < AwayGoals) OR (AwayTeamID = ? AND AwayGoals < HomeGoals) THEN 1 
          ELSE 0 END) as Losses,
        SUM(CASE WHEN HomeTeamID = ? THEN HomeGoals ELSE AwayGoals END) as GoalsFor,
        SUM(CASE WHEN HomeTeamID = ? THEN AwayGoals ELSE HomeGoals END) as GoalsAgainst
      FROM fixtures
      WHERE LeagueID = ? AND (HomeTeamID = ? OR AwayTeamID = ?)
    `, [team.TeamID, team.TeamID, team.TeamID, team.TeamID, team.TeamID, team.TeamID, leagueId, team.TeamID, team.TeamID]);

    const s = stats[0];
    const points = (s.Wins * 3) + s.Draws;

    // Upsert standings
    await conn.query(`
      INSERT INTO standings (LeagueID, TeamID, Points, Played, Wins, Draws, Losses, GoalsFor, GoalsAgainst, Position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE
        Points = ?, Played = ?, Wins = ?, Draws = ?, Losses = ?,
        GoalsFor = ?, GoalsAgainst = ?
    `, [leagueId, team.TeamID, points, s.Played, s.Wins, s.Draws, s.Losses, s.GoalsFor, s.GoalsAgainst,
        points, s.Played, s.Wins, s.Draws, s.Losses, s.GoalsFor, s.GoalsAgainst]);
  }

  // Update positions based on points, then goal difference
  const [standings] = await conn.query(`
    SELECT StandingID FROM standings 
    WHERE LeagueID = ? 
    ORDER BY Points DESC, (GoalsFor - GoalsAgainst) DESC, GoalsFor DESC
  `, [leagueId]);

  for (let i = 0; i < standings.length; i++) {
    await conn.query('UPDATE standings SET Position = ? WHERE StandingID = ?', [i + 1, standings[i].StandingID]);
  }
}
