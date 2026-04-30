// Top navbar component with mobile menu toggle and breadcrumb
import { useLocation } from 'react-router-dom';
import { MdMenu, MdNotifications } from 'react-icons/md';

const routeTitles = {
  '/': 'Dashboard',
  '/teams': 'Teams Management',
  '/players': 'Players Management',
  '/matches': 'Matches',
  '/standings': 'League Standings',
  '/statistics': 'Statistics & Reports',
  '/venues': 'Venues',
  '/managers': 'Managers',
  '/leagues': 'Leagues',
};

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'FootballDB';

  return (
    <header
      className="sticky top-0 z-30 px-4 lg:px-6 py-3 flex items-center justify-between"
      style={{
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
          id="mobile-menu-toggle"
        >
          <MdMenu className="text-xl" />
        </button>
        <div>
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}
          >
            {title}
          </h2>
          <p className="text-xs hidden sm:block" style={{ color: '#64748b' }}>
            Football League Management System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors relative"
          id="notifications-btn"
        >
          <MdNotifications className="text-xl" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#3b82f6' }}
          />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
