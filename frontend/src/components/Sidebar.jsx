// Sidebar navigation component with active route highlighting
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdGroups,
  MdSportsKabaddi,
  MdSportsSoccer,
  MdLeaderboard,
  MdBarChart,
  MdStadium,
  MdPerson,
  MdEmojiEvents,
} from 'react-icons/md';

const navItems = [
  { path: '/', label: 'Dashboard', icon: MdDashboard },
  { path: '/teams', label: 'Teams', icon: MdGroups },
  { path: '/players', label: 'Players', icon: MdSportsKabaddi },
  { path: '/matches', label: 'Matches', icon: MdSportsSoccer },
  { path: '/standings', label: 'Standings', icon: MdLeaderboard },
  { path: '/statistics', label: 'Statistics', icon: MdBarChart },
  { path: '/venues', label: 'Venues', icon: MdStadium },
  { path: '/managers', label: 'Managers', icon: MdPerson },
  { path: '/leagues', label: 'Leagues', icon: MdEmojiEvents },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.95) 100%)',
          borderRight: '1px solid rgba(148,163,184,0.08)',
        }}
      >
        {/* Logo Area */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              ⚽
            </div>
            <div>
              <h1
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}
              >
                FootballDB
              </h1>
              <p className="text-xs" style={{ color: '#64748b' }}>
                League Manager
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 mt-2 flex flex-col gap-0.5">
          <p
            className="px-3 mb-2 text-xs font-semibold tracking-widest uppercase"
            style={{ color: '#475569' }}
          >
            Navigation
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
                      boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.2)',
                    }
                  : {}
              }
            >
              <item.icon className="text-lg flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div
            className="rounded-xl p-3 text-center"
            style={{
              background: 'rgba(59,130,246,0.05)',
              border: '1px solid rgba(59,130,246,0.1)',
            }}
          >
            <p className="text-xs" style={{ color: '#64748b' }}>
              DBMS Project 2026
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
