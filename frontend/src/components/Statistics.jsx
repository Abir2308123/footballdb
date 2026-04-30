// Statistics & Reports page - team rankings, venue utilization, age/position charts
import { useState, useEffect } from 'react';
import { standingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

const chartColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];
const pieColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await standingsAPI.getStatistics();
      setStats(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 page-enter">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-80 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-4 lg:p-6 space-y-6 page-enter">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Teams by Win % */}
        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
            🏆 Best Teams by Win %
          </h3>
          <div className="space-y-3">
            {stats.teamStats.map((team, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl p-3"
                style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.04)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: idx === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(148,163,184,0.1)',
                      color: idx === 0 ? '#fbbf24' : '#94a3b8',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>{team.TeamName}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      {team.LeagueName} • {team.Played}P {team.Wins}W {team.Draws}D {team.Losses}L
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: '#3b82f6', fontFamily: 'var(--font-heading)' }}>
                    {team.WinPercentage}%
                  </p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{team.Points} pts</p>
                </div>
              </div>
            ))}
            {stats.teamStats.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: '#64748b' }}>No team data</p>
            )}
          </div>
        </div>

        {/* Top Scoring Teams */}
        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
            ⚽ Top Scoring Teams (Goals/Game)
          </h3>
          {stats.topScorers.length > 0 ? (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart
                  data={stats.topScorers.map((t) => ({ name: t.TeamName, GoalsPerGame: t.GoalsPerGame }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(148,163,184,0.1)' }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(148,163,184,0.1)' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)',
                      borderRadius: '10px', color: '#e2e8f0', fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="GoalsPerGame" radius={[6, 6, 0, 0]}>
                    {stats.topScorers.map((_, idx) => (
                      <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: '#64748b' }}>No scoring data</p>
          )}
        </div>

        {/* Venue Utilization */}
        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
            🏟️ Venue Utilization
          </h3>
          <div className="space-y-3">
            {stats.venueStats.map((venue, idx) => (
              <div key={idx} className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.4)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>{venue.Name}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>{venue.City} • Cap: {venue.Capacity?.toLocaleString()}</p>
                  </div>
                  <span className="badge badge-blue">{venue.MatchCount} matches</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'rgba(148,163,184,0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((venue.MatchCount / Math.max(...stats.venueStats.map((v) => v.MatchCount), 1)) * 100, 100)}%`,
                      background: chartColors[idx % chartColors.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
            📊 Player Age Distribution
          </h3>
          {stats.ageDistribution.length > 0 ? (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart
                  data={stats.ageDistribution.map((a) => ({ name: a.AgeGroup, Count: a.Count }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(148,163,184,0.1)' }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(148,163,184,0.1)' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)',
                      borderRadius: '10px', color: '#e2e8f0', fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="Count" radius={[6, 6, 0, 0]}>
                    {stats.ageDistribution.map((_, idx) => (
                      <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: '#64748b' }}>No player data</p>
          )}
        </div>

        {/* Position Distribution Pie */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
            🎯 Player Position Distribution
          </h3>
          {stats.positionDistribution.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.positionDistribution.map((p) => ({ name: p.Position, value: p.Count }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.positionDistribution.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)',
                      borderRadius: '10px', color: '#e2e8f0', fontSize: '13px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#94a3b8', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: '#64748b' }}>No position data</p>
          )}
        </div>
      </div>
    </div>
  );
}
