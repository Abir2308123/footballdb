// Database seed script - Creates tables and inserts sample data
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  console.log('🔗 Connected to MySQL server');

  // Create database
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'football_league'}\``);
  await connection.query(`USE \`${process.env.DB_NAME || 'football_league'}\``);
  console.log('📦 Database ready');

  // Drop existing tables in correct order (respecting foreign keys)
  await connection.query(`
    SET FOREIGN_KEY_CHECKS = 0;
    DROP TABLE IF EXISTS STANDINGS;
    DROP TABLE IF EXISTS \`MATCH\`;
    DROP TABLE IF EXISTS PLAYER;
    DROP TABLE IF EXISTS TEAM;
    DROP TABLE IF EXISTS MANAGER;
    DROP TABLE IF EXISTS VENUE;
    DROP TABLE IF EXISTS LEAGUE;
    SET FOREIGN_KEY_CHECKS = 1;
  `);
  console.log('🗑️  Dropped existing tables');

  // Create LEAGUE table
  await connection.query(`
    CREATE TABLE LEAGUE (
      LeagueID INT PRIMARY KEY AUTO_INCREMENT,
      LeagueName VARCHAR(100) NOT NULL UNIQUE,
      Country VARCHAR(100) NOT NULL,
      UEFACoefficient DECIMAL(5,2) DEFAULT 0.00
    )
  `);

  // Create MANAGER table (created before TEAM due to circular reference)
  await connection.query(`
    CREATE TABLE MANAGER (
      ManagerID INT PRIMARY KEY AUTO_INCREMENT,
      Name VARCHAR(100) NOT NULL,
      TeamID INT UNIQUE
    )
  `);

  // Create TEAM table
  await connection.query(`
    CREATE TABLE TEAM (
      TeamID INT PRIMARY KEY AUTO_INCREMENT,
      TeamName VARCHAR(100) NOT NULL UNIQUE,
      JerseyColor VARCHAR(50) NOT NULL,
      ManagerID INT,
      LeagueID INT,
      FOREIGN KEY (ManagerID) REFERENCES MANAGER(ManagerID) ON DELETE SET NULL,
      FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE SET NULL
    )
  `);

  // Add foreign key to MANAGER after TEAM is created
  await connection.query(`
    ALTER TABLE MANAGER ADD FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE SET NULL
  `);

  // Create PLAYER table
  await connection.query(`
    CREATE TABLE PLAYER (
      PlayerID INT PRIMARY KEY AUTO_INCREMENT,
      Name VARCHAR(100) NOT NULL,
      Age INT CHECK (Age BETWEEN 16 AND 45),
      Position VARCHAR(20) NOT NULL,
      JerseyNo INT CHECK (JerseyNo BETWEEN 1 AND 99),
      TeamID INT,
      FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE SET NULL
    )
  `);

  // Create VENUE table
  await connection.query(`
    CREATE TABLE VENUE (
      VenueID INT PRIMARY KEY AUTO_INCREMENT,
      Name VARCHAR(100) NOT NULL UNIQUE,
      City VARCHAR(100) NOT NULL,
      Country VARCHAR(100) NOT NULL,
      Capacity INT CHECK (Capacity > 0)
    )
  `);

  // Create MATCH table
  await connection.query(`
    CREATE TABLE \`MATCH\` (
      MatchID INT PRIMARY KEY AUTO_INCREMENT,
      Date DATE NOT NULL,
      Time TIME NOT NULL,
      HomeGoals INT DEFAULT 0,
      AwayGoals INT DEFAULT 0,
      Winner VARCHAR(100),
      Referee VARCHAR(100) NOT NULL,
      HomeTeamID INT,
      AwayTeamID INT,
      VenueID INT,
      LeagueID INT,
      FOREIGN KEY (HomeTeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE,
      FOREIGN KEY (AwayTeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE,
      FOREIGN KEY (VenueID) REFERENCES VENUE(VenueID) ON DELETE SET NULL,
      FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE SET NULL
    )
  `);

  // Create STANDINGS table
  await connection.query(`
    CREATE TABLE STANDINGS (
      StandingID INT PRIMARY KEY AUTO_INCREMENT,
      LeagueID INT,
      TeamID INT,
      Position INT,
      Points INT DEFAULT 0,
      Played INT DEFAULT 0,
      Wins INT DEFAULT 0,
      Draws INT DEFAULT 0,
      Losses INT DEFAULT 0,
      GoalsFor INT DEFAULT 0,
      GoalsAgainst INT DEFAULT 0,
      UNIQUE(LeagueID, TeamID),
      FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE,
      FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE
    )
  `);

  console.log('✅ All tables created');

  // === INSERT SAMPLE DATA ===

  // Leagues
  await connection.query(`
    INSERT INTO LEAGUE (LeagueName, Country, UEFACoefficient) VALUES
    ('Premier League', 'England', 95.50),
    ('La Liga', 'Spain', 88.75),
    ('Bundesliga', 'Germany', 79.30)
  `);

  // Managers
  await connection.query(`
    INSERT INTO MANAGER (Name) VALUES
    ('Erik ten Hag'),
    ('Mauricio Pochettino'),
    ('Carlo Ancelotti'),
    ('Xavi Hernandez'),
    ('Thomas Tuchel')
  `);

  // Teams
  await connection.query(`
    INSERT INTO TEAM (TeamName, JerseyColor, ManagerID, LeagueID) VALUES
    ('Manchester United', 'Red', 1, 1),
    ('Chelsea FC', 'Blue', 2, 1),
    ('Real Madrid', 'White', 3, 2),
    ('FC Barcelona', 'Blue-Red', 4, 2),
    ('Bayern Munich', 'Red', 5, 3)
  `);

  // Update Manager TeamIDs
  await connection.query(`UPDATE MANAGER SET TeamID = 1 WHERE ManagerID = 1`);
  await connection.query(`UPDATE MANAGER SET TeamID = 2 WHERE ManagerID = 2`);
  await connection.query(`UPDATE MANAGER SET TeamID = 3 WHERE ManagerID = 3`);
  await connection.query(`UPDATE MANAGER SET TeamID = 4 WHERE ManagerID = 4`);
  await connection.query(`UPDATE MANAGER SET TeamID = 5 WHERE ManagerID = 5`);

  // Players
  await connection.query(`
    INSERT INTO PLAYER (Name, Age, Position, JerseyNo, TeamID) VALUES
    ('Bruno Fernandes', 29, 'Midfielder', 8, 1),
    ('Marcus Rashford', 26, 'Forward', 10, 1),
    ('Harry Maguire', 31, 'Defender', 5, 1),
    ('Andre Onana', 28, 'Goalkeeper', 24, 1),
    ('Raheem Sterling', 29, 'Forward', 7, 2),
    ('Enzo Fernandez', 23, 'Midfielder', 8, 2),
    ('Reece James', 24, 'Defender', 24, 2),
    ('Robert Sanchez', 26, 'Goalkeeper', 1, 2),
    ('Jude Bellingham', 20, 'Midfielder', 5, 3),
    ('Vinicius Jr', 24, 'Forward', 7, 3),
    ('Antonio Rudiger', 31, 'Defender', 22, 3),
    ('Thibaut Courtois', 32, 'Goalkeeper', 1, 3),
    ('Robert Lewandowski', 35, 'Forward', 9, 4),
    ('Pedri', 21, 'Midfielder', 8, 4),
    ('Ronald Araujo', 25, 'Defender', 4, 4),
    ('Marc-Andre ter Stegen', 32, 'Goalkeeper', 1, 4),
    ('Harry Kane', 30, 'Forward', 9, 5),
    ('Jamal Musiala', 21, 'Midfielder', 42, 5),
    ('Dayot Upamecano', 25, 'Defender', 2, 5),
    ('Manuel Neuer', 38, 'Goalkeeper', 1, 5),
    ('Lionel Messi', 37, 'Forward', 10, NULL),
    ('Cristiano Ronaldo', 41, 'Forward', 7, NULL)
  `);

  // Venues
  await connection.query(`
    INSERT INTO VENUE (Name, City, Country, Capacity) VALUES
    ('Old Trafford', 'Manchester', 'England', 74310),
    ('Stamford Bridge', 'London', 'England', 40343),
    ('Santiago Bernabeu', 'Madrid', 'Spain', 81044),
    ('Camp Nou', 'Barcelona', 'Spain', 99354),
    ('Allianz Arena', 'Munich', 'Germany', 75000)
  `);

  // Matches
  await connection.query(`
    INSERT INTO \`MATCH\` (Date, Time, HomeGoals, AwayGoals, Winner, Referee, HomeTeamID, AwayTeamID, VenueID, LeagueID) VALUES
    ('2024-09-15', '15:00:00', 3, 1, 'Manchester United', 'Michael Oliver', 1, 2, 1, 1),
    ('2024-09-22', '20:00:00', 2, 2, 'Draw', 'Anthony Taylor', 2, 1, 2, 1),
    ('2024-10-06', '21:00:00', 2, 1, 'Real Madrid', 'Jesus Gil Manzano', 3, 4, 3, 2),
    ('2024-10-20', '18:00:00', 3, 0, 'FC Barcelona', 'Mateu Lahoz', 4, 3, 4, 2),
    ('2024-11-03', '15:00:00', 1, 0, 'Manchester United', 'Stuart Attwell', 1, 2, 1, 1),
    ('2024-11-10', '20:45:00', 4, 2, 'Real Madrid', 'Antonio Mateu', 3, 4, 3, 2),
    ('2024-11-24', '17:30:00', 2, 0, 'Chelsea FC', 'Craig Pawson', 2, 1, 2, 1),
    ('2024-12-01', '16:00:00', 1, 1, 'Draw', 'Carlos del Cerro', 4, 3, 4, 2)
  `);

  // Standings
  await connection.query(`
    INSERT INTO STANDINGS (LeagueID, TeamID, Position, Points, Played, Wins, Draws, Losses, GoalsFor, GoalsAgainst) VALUES
    (1, 1, 1, 7, 4, 2, 1, 1, 6, 4),
    (1, 2, 2, 5, 4, 1, 2, 1, 5, 5),
    (2, 3, 1, 9, 4, 3, 0, 1, 9, 5),
    (2, 4, 2, 7, 4, 2, 1, 1, 7, 5),
    (3, 5, 1, 0, 0, 0, 0, 0, 0, 0)
  `);

  console.log('🌱 Sample data inserted successfully');
  console.log('🎉 Database seeding complete!');

  await connection.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
