// League Standings page - select league, view standings table with points chart
import { useState, useEffect } from 'react';
import { standingsAPI, leagueAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const chartColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

export default function Standings() {
  const [leagues, setLeagues] = useState([]);
  const [standings, setStandings] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) loadStandings();
  }, [selectedLeague]);

  const loadLeagues = async () => {
    try {
      const res = await leagueAPI.getAll();
      setLeagues(res.data);
      if (res.data.length > 0) {
        setSelectedLeague(res.data[0].LeagueID);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStandings = async () => {
    try {
      const res = await standingsAPI.getByLeague(selectedLeague);
      setStandings(res.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const chartData = standings.map((s) => ({
    name: s.TeamName,
    Points: s.Points,
    GD: s.GoalsFor - s.GoalsAgainst,
  }));

  const currentLeague = leagues.find((l) => l.LeagueID === parseInt(selectedLeague));

  if (loading) {
    return (
      <div className="p-4 lg:p-6 page-enter">
        <div className="skeleton h-12 w-64 rounded-xl mb-6" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 page-enter">
      {/* League Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="form-select max-w-xs"
          id="standings-league-select"
        >
          {leagues.map((l) => (
            <option key={l.LeagueID} value={l.LeagueID}>
              {l.LeagueName} — {l.Country}
            </option>
          ))}
        </select>
        {currentLeague && (
          <div className="badge badge-blue">
            UEFA Coefficient: {currentLeague.UEFACoefficient}
          </div>
        )}
      </div>

      {/* Standings Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8" style={{ color: '#64748b' }}>
                    No standings data for this league
                  </td>
                </tr>
              ) : (
                standings.map((s, idx) => (
                  <tr key={s.StandingID}>
                    <td>
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold inline-flex"
                        style={{
                          background: idx === 0 ? 'rgba(245,158,11,0.2)' : idx < 3 ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.1)',
                          color: idx === 0 ? '#fbbf24' : idx < 3 ? '#60a5fa' : '#94a3b8',
                        }}
                      >
                        {s.Position}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: s.JerseyColor?.toLowerCase() === 'red' ? '#ef4444'
                              : s.JerseyColor?.toLowerCase() === 'blue' ? '#3b82f6'
                              : s.JerseyColor?.toLowerCase() === 'white' ? '#e2e8f0'
                              : s.JerseyColor?.toLowerCase().includes('blue') ? '#3b82f6'
                              : '#94a3b8',
                          }}
                        />
                        <span className="font-semibold" style={{ color: '#f1f5f9' }}>{s.TeamName}</span>
                      </div>
                    </td>
                    <td>{s.Played}</td>
                    <td style={{ color: '#34d399' }}>{s.Wins}</td>
                    <td style={{ color: '#fbbf24' }}>{s.Draws}</td>
                    <td style={{ color: '#f87171' }}>{s.Losses}</td>
                    <td>{s.GoalsFor}</td>
                    <td>{s.GoalsAgainst}</td>
                    <td>
                      <span style={{ color: (s.GoalsFor - s.GoalsAgainst) >= 0 ? '#34d399' : '#f87171' }}>
                        {(s.GoalsFor - s.GoalsAgainst) > 0 ? '+' : ''}{s.GoalsFor - s.GoalsAgainst}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-lg" style={{ color: '#3b82f6', fontFamily: 'var(--font-heading)' }}>
                        {s.Points}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Points Distribution Chart */}
      {standings.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
            Points Distribution
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(148,163,184,0.1)',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="Points" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
