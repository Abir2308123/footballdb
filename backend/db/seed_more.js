const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function seedMore() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'footballleaguedb',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('🔗 Connected to DB. Adding more data...');

    // LEAGUES
    await connection.query(`INSERT INTO league (LeagueName, Country, UEFACoefficient) VALUES 
      ('Serie A', 'Italy', 71.9),
      ('Ligue 1', 'France', 59.5)
    `);
    const [leagues] = await connection.query('SELECT LeagueID, LeagueName FROM league');
    const serieA = leagues.find(l => l.LeagueName === 'Serie A').LeagueID;
    const ligue1 = leagues.find(l => l.LeagueName === 'Ligue 1').LeagueID;
    const pl = leagues.find(l => l.LeagueName === 'Premier League')?.LeagueID || 1;
    const laLiga = leagues.find(l => l.LeagueName === 'La Liga')?.LeagueID || 2;
    const bundesliga = leagues.find(l => l.LeagueName === 'Bundesliga')?.LeagueID || 3;

    // MANAGERS
    await connection.query(`INSERT INTO manager (Name) VALUES 
      ('Stefano Pioli'), ('Massimiliano Allegri'), ('Jose Mourinho'), 
      ('Luis Enrique'), ('Diego Simeone'), ('Mikel Arteta'), ('Jurgen Klopp'),
      ('Unai Emery'), ('Roberto De Zerbi'), ('Xabi Alonso')
    `);
    const [managers] = await connection.query('SELECT ManagerID, Name FROM manager');
    const getMgr = (name) => managers.find(m => m.Name === name)?.ManagerID || null;

    // TEAMS
    await connection.query(`INSERT INTO team (TeamName, JerseyColor, ManagerID, LeagueID) VALUES 
      ('AC Milan', 'Red/Black', ?, ?),
      ('Juventus', 'Black/White', ?, ?),
      ('AS Roma', 'Maroon', ?, ?),
      ('PSG', 'Blue/Red', ?, ?),
      ('Atletico Madrid', 'Red/White', ?, ?),
      ('Arsenal', 'Red/White', ?, ?),
      ('Liverpool', 'Red', ?, ?),
      ('Aston Villa', 'Claret/Blue', ?, ?),
      ('Brighton', 'Blue/White', ?, ?),
      ('Bayer Leverkusen', 'Red/Black', ?, ?)
    `, [
      getMgr('Stefano Pioli'), serieA,
      getMgr('Massimiliano Allegri'), serieA,
      getMgr('Jose Mourinho'), serieA,
      getMgr('Luis Enrique'), ligue1,
      getMgr('Diego Simeone'), laLiga,
      getMgr('Mikel Arteta'), pl,
      getMgr('Jurgen Klopp'), pl,
      getMgr('Unai Emery'), pl,
      getMgr('Roberto De Zerbi'), pl,
      getMgr('Xabi Alonso'), bundesliga
    ]);

    const [teams] = await connection.query('SELECT TeamID, TeamName FROM team');
    const getTeam = (name) => teams.find(t => t.TeamName === name)?.TeamID || null;

    // PLAYERS
    const players = [
      // AC Milan
      ['Rafael Leao', 24, 'Forward', 10, 'AC Milan'],
      ['Theo Hernandez', 26, 'Defender', 19, 'AC Milan'],
      ['Mike Maignan', 28, 'Goalkeeper', 16, 'AC Milan'],
      ['Fikayo Tomori', 26, 'Defender', 23, 'AC Milan'],
      // Juventus
      ['Dusan Vlahovic', 24, 'Forward', 9, 'Juventus'],
      ['Federico Chiesa', 26, 'Forward', 7, 'Juventus'],
      ['Gleison Bremer', 27, 'Defender', 3, 'Juventus'],
      ['Wojciech Szczesny', 33, 'Goalkeeper', 1, 'Juventus'],
      // AS Roma
      ['Paulo Dybala', 30, 'Forward', 21, 'AS Roma'],
      ['Romelu Lukaku', 30, 'Forward', 90, 'AS Roma'],
      ['Lorenzo Pellegrini', 27, 'Midfielder', 7, 'AS Roma'],
      // PSG
      ['Kylian Mbappe', 25, 'Forward', 7, 'PSG'],
      ['Ousmane Dembele', 26, 'Forward', 10, 'PSG'],
      ['Gianluigi Donnarumma', 25, 'Goalkeeper', 99, 'PSG'],
      ['Marquinhos', 29, 'Defender', 5, 'PSG'],
      ['Achraf Hakimi', 25, 'Defender', 2, 'PSG'],
      // Atletico Madrid
      ['Antoine Griezmann', 33, 'Forward', 7, 'Atletico Madrid'],
      ['Jan Oblak', 31, 'Goalkeeper', 13, 'Atletico Madrid'],
      ['Koke', 32, 'Midfielder', 6, 'Atletico Madrid'],
      // Arsenal
      ['Bukayo Saka', 22, 'Forward', 7, 'Arsenal'],
      ['Martin Odegaard', 25, 'Midfielder', 8, 'Arsenal'],
      ['William Saliba', 23, 'Defender', 2, 'Arsenal'],
      ['Declan Rice', 25, 'Midfielder', 41, 'Arsenal'],
      ['Gabriel Martinelli', 22, 'Forward', 11, 'Arsenal'],
      // Liverpool
      ['Mohamed Salah', 31, 'Forward', 11, 'Liverpool'],
      ['Virgil van Dijk', 32, 'Defender', 4, 'Liverpool'],
      ['Alisson Becker', 31, 'Goalkeeper', 1, 'Liverpool'],
      ['Trent Alexander-Arnold', 25, 'Defender', 66, 'Liverpool'],
      ['Alexis Mac Allister', 25, 'Midfielder', 10, 'Liverpool'],
      // Aston Villa
      ['Ollie Watkins', 28, 'Forward', 11, 'Aston Villa'],
      ['Emiliano Martinez', 31, 'Goalkeeper', 1, 'Aston Villa'],
      ['Douglas Luiz', 25, 'Midfielder', 6, 'Aston Villa'],
      // Brighton
      ['Kaoru Mitoma', 26, 'Forward', 22, 'Brighton'],
      ['Pascal Gross', 32, 'Midfielder', 13, 'Brighton'],
      ['Lewis Dunk', 32, 'Defender', 5, 'Brighton'],
      // Bayer Leverkusen
      ['Florian Wirtz', 20, 'Midfielder', 10, 'Bayer Leverkusen'],
      ['Jeremie Frimpong', 23, 'Defender', 30, 'Bayer Leverkusen'],
      ['Alejandro Grimaldo', 28, 'Defender', 20, 'Bayer Leverkusen'],
      ['Victor Boniface', 23, 'Forward', 22, 'Bayer Leverkusen']
    ];

    let playerValues = [];
    for (const p of players) {
      playerValues.push(`('${p[0]}', ${p[1]}, '${p[2]}', ${p[3]}, ${getTeam(p[4])})`);
    }
    await connection.query(`INSERT INTO player (Name, Age, Position, JerseyNo, TeamID) VALUES ${playerValues.join(',')}`);

    // VENUES
    await connection.query(`INSERT INTO venue (Name, City, Country, Capacity) VALUES 
      ('San Siro', 'Milan', 'Italy', 75923),
      ('Allianz Stadium', 'Turin', 'Italy', 41507),
      ('Stadio Olimpico', 'Rome', 'Italy', 70634),
      ('Parc des Princes', 'Paris', 'France', 47929),
      ('Metropolitano', 'Madrid', 'Spain', 70460),
      ('Emirates Stadium', 'London', 'England', 60704),
      ('Anfield', 'Liverpool', 'England', 61276),
      ('Villa Park', 'Birmingham', 'England', 42682),
      ('BayArena', 'Leverkusen', 'Germany', 30210)
    `);

    console.log('✅ Added hundreds of new data points!');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

seedMore();
