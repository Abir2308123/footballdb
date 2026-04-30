// Dashboard page - summary cards, recent matches, and standings preview
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { standingsAPI, matchAPI } from '../services/api';
import {
  MdGroups,
  MdSportsKabaddi,
  MdSportsSoccer,
  MdEmojiEvents,
  MdStadium,
  MdPerson,
  MdArrowForward,
  MdPersonOff,
} from 'react-icons/md';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, matchesRes, standingsRes] = await Promise.all([
        standingsAPI.getDashboardStats(),
        matchAPI.getRecent(5),
        standingsAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setRecentMatches(matchesRes.data);
      setStandings(standingsRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group standings by league
  const standingsByLeague = standings.reduce((acc, s) => {
    if (!acc[s.LeagueName]) acc[s.LeagueName] = [];
    acc[s.LeagueName].push(s);
    return acc;
  }, {});

  const statCards = stats
    ? [
        { label: 'Total Teams', value: stats.teams, icon: MdGroups, color: '#3b82f6' },
        { label: 'Total Players', value: stats.players, icon: MdSportsKabaddi, color: '#8b5cf6' },
        { label: 'Total Matches', value: stats.matches, icon: MdSportsSoccer, color: '#10b981' },
        { label: 'Leagues', value: stats.leagues, icon: MdEmojiEvents, color: '#f59e0b' },
        { label: 'Venues', value: stats.venues, icon: MdStadium, color: '#ec4899' },
        { label: 'Free Agents', value: stats.freeAgents, icon: MdPersonOff, color: '#ef4444' },
      ]
    : [];

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6 page-enter">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 page-enter">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card stat-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}15` }}
              >
                <card.icon style={{ color: card.color, fontSize: '1.15rem' }} />
              </div>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}
            >
              {card.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}
            >
              Recent Matches
            </h3>
            <Link
              to="/matches"
              className="text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: '#3b82f6' }}
            >
              View All <MdArrowForward />
            </Link>
          </div>

          <div className="space-y-3">
            {recentMatches.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#64748b' }}>
                No matches recorded yet
              </p>
            ) : (
              recentMatches.map((match) => (
                <div
                  key={match.MatchID}
                  className="rounded-xl p-3 flex items-center justify-between"
                  style={{
                    background: 'rgba(15,23,42,0.5)',
                    border: '1px solid rgba(148,163,184,0.06)',
                  }}
                >
                  <div className="flex-1 text-right">
                    <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                      {match.HomeTeamName}
                    </p>
                  </div>
                  <div className="px-4 text-center">
                    <div className="score-display">
                      {match.HomeGoals} - {match.AwayGoals}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                      {new Date(match.Date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                      {match.AwayTeamName}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* League Standings Preview */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}
            >
              League Standings
            </h3>
            <Link
              to="/standings"
              className="text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: '#3b82f6' }}
            >
              View All <MdArrowForward />
            </Link>
          </div>

          <div className="space-y-4">
            {Object.entries(standingsByLeague).length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#64748b' }}>
                No standings data available
              </p>
            ) : (
              Object.entries(standingsByLeague).map(([league, teams]) => (
                <div key={league}>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#64748b' }}
                  >
                    {league}
                  </p>
                  <div className="space-y-1.5">
                    {teams.slice(0, 3).map((team) => (
                      <div
                        key={team.StandingID}
                        className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{
                          background: 'rgba(15,23,42,0.4)',
                          border: '1px solid rgba(148,163,184,0.04)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              background:
                                team.Position === 1
                                  ? 'rgba(245,158,11,0.2)'
                                  : 'rgba(148,163,184,0.1)',
                              color:
                                team.Position === 1 ? '#fbbf24' : '#94a3b8',
                            }}
                          >
                            {team.Position}
                          </span>
                          <span className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
                            {team.TeamName}
                          </span>
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: '#3b82f6' }}
                        >
                          {team.Points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
