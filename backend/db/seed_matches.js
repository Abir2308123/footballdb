const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function seedMatches() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'footballleaguedb',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('🔗 Connected to DB. Generating matches...');

    const [teams] = await connection.query('SELECT TeamID, TeamName, LeagueID FROM team');
    const [venues] = await connection.query('SELECT VenueID FROM venue');
    const [leagues] = await connection.query('SELECT LeagueID FROM league');

    if (venues.length === 0) {
      console.log('No venues found!');
      return;
    }

    const referees = ['Michael Oliver', 'Anthony Taylor', 'Daniele Orsato', 'Clement Turpin', 'Felix Zwayer', 'Szymon Marciniak'];

    // Group teams by league
    const leagueTeams = {};
    for (const l of leagues) {
      leagueTeams[l.LeagueID] = teams.filter(t => t.LeagueID === l.LeagueID);
    }

    let matchValues = [];
    
    // Generate matches
    for (const l of leagues) {
      const teamsInLeague = leagueTeams[l.LeagueID];
      if (teamsInLeague.length < 2) continue;

      // Play 2 matches between every pair
      for (let i = 0; i < teamsInLeague.length; i++) {
        for (let j = i + 1; j < teamsInLeague.length; j++) {
          const t1 = teamsInLeague[i];
          const t2 = teamsInLeague[j];

          // Match 1 (t1 home)
          let h1 = Math.floor(Math.random() * 4);
          let a1 = Math.floor(Math.random() * 4);
          let w1 = h1 > a1 ? t1.TeamName : (a1 > h1 ? t2.TeamName : 'Draw');
          let v1 = venues[Math.floor(Math.random() * venues.length)].VenueID;
          let r1 = referees[Math.floor(Math.random() * referees.length)];
          let d1 = `2024-0${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 28) + 1}`;
          
          matchValues.push(`('${d1}', '15:00:00', ${h1}, ${a1}, '${w1}', '${r1}', ${t1.TeamID}, ${t2.TeamID}, ${v1}, ${l.LeagueID})`);

          // Match 2 (t2 home)
          let h2 = Math.floor(Math.random() * 4);
          let a2 = Math.floor(Math.random() * 4);
          let w2 = h2 > a2 ? t2.TeamName : (a2 > h2 ? t1.TeamName : 'Draw');
          let v2 = venues[Math.floor(Math.random() * venues.length)].VenueID;
          let r2 = referees[Math.floor(Math.random() * referees.length)];
          let d2 = `2024-0${Math.floor(Math.random() * 4) + 6}-${Math.floor(Math.random() * 28) + 1}`;

          matchValues.push(`('${d2}', '20:00:00', ${h2}, ${a2}, '${w2}', '${r2}', ${t2.TeamID}, ${t1.TeamID}, ${v2}, ${l.LeagueID})`);
        }
      }
    }

    if (matchValues.length > 0) {
      await connection.query(`
        INSERT INTO fixtures (Date, Time, HomeGoals, AwayGoals, Winner, Referee, HomeTeamID, AwayTeamID, VenueID, LeagueID) 
        VALUES ${matchValues.join(',')}
      `);
      console.log(`✅ Inserted ${matchValues.length} new matches!`);
    } else {
      console.log('Not enough teams per league to generate matches.');
      return;
    }

    // RECALCULATE STANDINGS
    console.log('📊 Recalculating standings for all leagues...');
    for (const l of leagues) {
      const leagueId = l.LeagueID;
      const [leagueTeamsDB] = await connection.query('SELECT TeamID FROM team WHERE LeagueID = ?', [leagueId]);

      for (const team of leagueTeamsDB) {
        const [stats] = await connection.query(`
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

        const s = stats[0] || { Played: 0, Wins: 0, Draws: 0, Losses: 0, GoalsFor: 0, GoalsAgainst: 0 };
        const points = (s.Wins * 3) + (s.Draws * 1);

        // Try to get existing standing ID
        const [existing] = await connection.query('SELECT StandingID FROM standings WHERE LeagueID = ? AND TeamID = ?', [leagueId, team.TeamID]);
        
        if (existing.length > 0) {
          await connection.query(`
            UPDATE standings SET 
              Points = ?, Played = ?, Wins = ?, Draws = ?, Losses = ?, GoalsFor = ?, GoalsAgainst = ?
            WHERE StandingID = ?
          `, [points, s.Played || 0, s.Wins || 0, s.Draws || 0, s.Losses || 0, s.GoalsFor || 0, s.GoalsAgainst || 0, existing[0].StandingID]);
        } else {
          await connection.query(`
            INSERT INTO standings (LeagueID, TeamID, Points, Played, Wins, Draws, Losses, GoalsFor, GoalsAgainst, Position)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
          `, [leagueId, team.TeamID, points, s.Played || 0, s.Wins || 0, s.Draws || 0, s.Losses || 0, s.GoalsFor || 0, s.GoalsAgainst || 0]);
        }
      }

      // Update positions
      const [standings] = await connection.query(`
        SELECT StandingID FROM standings 
        WHERE LeagueID = ? 
        ORDER BY Points DESC, (GoalsFor - GoalsAgainst) DESC, GoalsFor DESC
      `, [leagueId]);

      for (let i = 0; i < standings.length; i++) {
        await connection.query('UPDATE standings SET Position = ? WHERE StandingID = ?', [i + 1, standings[i].StandingID]);
      }
    }
    
    console.log('🏆 Standings fully updated!');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

seedMatches();
