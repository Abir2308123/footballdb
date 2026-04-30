// Main App component - Layout with Sidebar, Navbar, and route-based content
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Teams from './components/Teams';
import Players from './components/Players';
import Matches from './components/Matches';
import Standings from './components/Standings';
import Statistics from './components/Statistics';
import Venues from './components/Venues';
import Managers from './components/Managers';
import Leagues from './components/Leagues';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      {/* Background pattern */}
      <div className="bg-pattern" />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/players" element={<Players />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/managers" element={<Managers />} />
            <Route path="/leagues" element={<Leagues />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
