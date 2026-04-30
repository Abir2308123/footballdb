# ⚽ Football League Management System

A full-stack web application for managing football leagues, teams, players, matches, and standings.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + Tailwind CSS v4 |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL + mysql2 |
| **Charts** | Recharts |
| **UI** | react-icons, react-hot-toast |
| **HTTP** | Axios |

## 📁 Project Structure

```
football-league-frontend/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── .env                   # Environment variables
│   ├── db/
│   │   ├── connection.js      # MySQL pool connection
│   │   └── seed.js            # Database seeder script
│   ├── routes/                # Express route definitions
│   │   ├── leagues.js
│   │   ├── teams.js
│   │   ├── players.js
│   │   ├── managers.js
│   │   ├── venues.js
│   │   ├── matches.js
│   │   └── standings.js
│   ├── controllers/           # Business logic
│   │   ├── leagueController.js
│   │   ├── teamController.js
│   │   ├── playerController.js
│   │   ├── managerController.js
│   │   ├── venueController.js
│   │   ├── matchController.js
│   │   └── standingsController.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Root component with routing
│   │   ├── main.jsx           # React entry point
│   │   ├── index.css          # Tailwind + custom design system
│   │   ├── components/
│   │   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   │   ├── Navbar.jsx     # Top navbar
│   │   │   ├── Dashboard.jsx  # Dashboard with stats
│   │   │   ├── Teams.jsx      # Teams CRUD
│   │   │   ├── Players.jsx    # Players CRUD
│   │   │   ├── Matches.jsx    # Matches management
│   │   │   ├── Standings.jsx  # League standings
│   │   │   ├── Statistics.jsx # Charts & reports
│   │   │   ├── Venues.jsx     # Venues CRUD
│   │   │   ├── Managers.jsx   # Managers CRUD
│   │   │   └── Leagues.jsx    # Leagues CRUD
│   │   └── services/
│   │       └── api.js         # Axios API service
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18+)
- **MySQL Server** (v8.0+)
- **npm** or **yarn**

### Step 1: Clone & Navigate
```bash
cd football-league-frontend
```

### Step 2: Configure Database
Edit `backend/.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_PORT=3306
DB_NAME=football_league
PORT=5000
```

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 4: Seed the Database
This creates all tables and inserts sample data:
```bash
npm run seed
```

### Step 5: Start Backend Server
```bash
npm run dev
```
The API will run on `http://localhost:5000`

### Step 6: Install Frontend Dependencies (new terminal)
```bash
cd frontend
npm install
```

### Step 7: Start Frontend
```bash
npm run dev
```
The app will open at `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leagues` | Get all leagues |
| POST | `/api/leagues` | Create league |
| PUT | `/api/leagues/:id` | Update league |
| DELETE | `/api/leagues/:id` | Delete league |
| GET | `/api/teams` | Get all teams (with JOINs) |
| POST | `/api/teams` | Create team |
| PUT | `/api/teams/:id` | Update team |
| DELETE | `/api/teams/:id` | Delete team (constraint check) |
| GET | `/api/players` | Get all players (filterable) |
| POST | `/api/players` | Add player |
| PUT | `/api/players/:id` | Update/transfer player |
| DELETE | `/api/players/:id` | Delete player |
| GET | `/api/managers` | Get all managers |
| POST | `/api/managers` | Add manager |
| PUT | `/api/managers/:id` | Update manager |
| DELETE | `/api/managers/:id` | Delete manager |
| GET | `/api/venues` | Get all venues |
| POST | `/api/venues` | Add venue |
| PUT | `/api/venues/:id` | Update venue |
| DELETE | `/api/venues/:id` | Delete venue |
| GET | `/api/matches` | Get all matches (filterable) |
| GET | `/api/matches/recent` | Get recent matches |
| POST | `/api/matches` | Schedule match |
| PUT | `/api/matches/:id` | Update result (auto-winner) |
| DELETE | `/api/matches/:id` | Delete match |
| GET | `/api/standings/:leagueId` | Get league standings |
| GET | `/api/standings/stats` | Dashboard statistics |
| GET | `/api/standings/statistics` | Detailed reports |

## ✨ Features

- **Dashboard** — Summary cards, recent matches, standings preview
- **Teams** — CRUD with league filter, search, delete constraints
- **Players** — CRUD with team transfer, free agent support, position/team filters
- **Matches** — Schedule, record results (auto-winner), league/date filters
- **Standings** — League-specific table with points chart
- **Statistics** — Win %, goals/game, venue utilization, age/position charts
- **Venues** — Card-based CRUD with capacity display
- **Managers** — CRUD with smart team assignment
- **Leagues** — CRUD with UEFA coefficient

## 🔧 Key Technical Features

- **Auto Winner Determination** — When match results are recorded, the winner is automatically calculated
- **Auto Standings Recalculation** — Points, wins, draws, losses are recalculated from match data
- **Transaction Support** — Match result updates use database transactions
- **Constraint Checks** — Cannot delete teams with matches, leagues with teams, etc.
- **Input Validation** — Age (16-45), Jersey (1-99), required fields
- **Toast Notifications** — Success/error feedback for all operations
- **Responsive Design** — Mobile-first with collapsible sidebar
- **Glassmorphism UI** — Premium dark theme with glass card effects

## 🗃️ Database Schema

The system uses 7 tables: LEAGUE, TEAM, PLAYER, MANAGER, VENUE, MATCH, STANDINGS with proper foreign key relationships and constraints.

---

**DBMS Project 2026** | Built with Node.js, React, MySQL
