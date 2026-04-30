// Matches Management - Schedule matches, record results, filter by league/date
import { useState, useEffect } from 'react';
import { matchAPI, teamAPI, venueAPI, leagueAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdFilterList, MdSportsSoccer } from 'react-icons/md';

const emptyForm = {
  Date: '', Time: '', Referee: '', HomeTeamID: '', AwayTeamID: '',
  LeagueID: '', HomeGoals: 0, AwayGoals: 0,
};

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [deletingMatch, setDeletingMatch] = useState(null);
  const [resultMatch, setResultMatch] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [resultForm, setResultForm] = useState({ HomeGoals: 0, AwayGoals: 0 });
  const [filterLeague, setFilterLeague] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, [filterLeague, startDate, endDate]);

  const loadData = async () => {
    try {
      const params = {};
      if (filterLeague) params.leagueId = filterLeague;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const [matchesRes, teamsRes, venuesRes, leaguesRes] = await Promise.all([
        matchAPI.getAll(params),
        teamAPI.getAll(),
        venueAPI.getAll(),
        leagueAPI.getAll(),
      ]);
      setMatches(matchesRes.data);
      setTeams(teamsRes.data);
      setVenues(venuesRes.data);
      setLeagues(leaguesRes.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      if (editingMatch) {
        await matchAPI.update(editingMatch.MatchID, form);
        toast.success('Match updated');
      } else {
        await matchAPI.create(form);
        toast.success('Match scheduled');
      }
      setShowModal(false);
      setEditingMatch(null);
      setForm(emptyForm);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRecordResult = async (e) => {
    e.preventDefault();
    try {
      await matchAPI.update(resultMatch.MatchID, {
        HomeGoals: parseInt(resultForm.HomeGoals),
        AwayGoals: parseInt(resultForm.AwayGoals),
      });
      toast.success('Result recorded — standings updated!');
      setShowResultModal(false);
      setResultMatch(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setForm({
      Date: match.Date?.split('T')[0] || '',
      Time: match.Time || '',
      Referee: match.Referee,
      HomeTeamID: match.HomeTeamID,
      AwayTeamID: match.AwayTeamID,
      LeagueID: match.LeagueID || '',
      HomeGoals: match.HomeGoals,
      AwayGoals: match.AwayGoals,
    });
    setShowModal(true);
  };

  const openResultModal = (match) => {
    setResultMatch(match);
    setResultForm({ HomeGoals: match.HomeGoals || 0, AwayGoals: match.AwayGoals || 0 });
    setShowResultModal(true);
  };

  const handleDelete = async () => {
    try {
      await matchAPI.delete(deletingMatch.MatchID);
      toast.success('Match deleted');
      setShowDeleteModal(false);
      setDeletingMatch(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 page-enter">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 page-enter">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <select value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)} className="form-select" id="match-filter-league">
            <option value="">All Leagues</option>
            {leagues.map((l) => <option key={l.LeagueID} value={l.LeagueID}>{l.LeagueName}</option>)}
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" placeholder="Start Date" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" placeholder="End Date" />
        </div>
        <button onClick={() => { setEditingMatch(null); setForm(emptyForm); setShowModal(true); }} className="btn btn-primary" id="schedule-match-btn">
          <MdAdd /> Schedule Match
        </button>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {matches.length === 0 ? (
          <div className="glass-card p-8 text-center" style={{ color: '#64748b' }}>
            No matches found
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.MatchID} className="glass-card p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* League Badge */}
                <div className="hidden sm:block">
                  <span className="badge badge-purple text-xs">{match.LeagueName || 'Friendly'}</span>
                </div>

                {/* Match Card */}
                <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8">
                  <div className="text-right flex-1">
                    <p className="font-semibold text-sm sm:text-base" style={{ color: '#f1f5f9' }}>
                      {match.HomeTeamName}
                    </p>
                    <p className="text-xs" style={{ color: '#64748b' }}>Home</p>
                  </div>
                  <div className="text-center px-3">
                    <div className="score-display">{match.HomeGoals} - {match.AwayGoals}</div>
                    <p className="text-xs mt-0.5" style={{ color: match.Winner === 'Draw' ? '#fbbf24' : '#34d399' }}>
                      {match.Winner || 'TBD'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base" style={{ color: '#f1f5f9' }}>
                      {match.AwayTeamName}
                    </p>
                    <p className="text-xs" style={{ color: '#64748b' }}>Away</p>
                  </div>
                </div>

                {/* Match Info */}
                <div className="text-center sm:text-right">
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    {new Date(match.Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{match.VenueName || '—'}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>Ref: {match.Referee}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button onClick={() => openResultModal(match)} className="btn btn-ghost btn-sm" title="Record Result">
                    <MdSportsSoccer className="text-green-400" />
                  </button>
                  <button onClick={() => handleEdit(match)} className="btn btn-ghost btn-sm" title="Edit">
                    <MdEdit />
                  </button>
                  <button onClick={() => { setDeletingMatch(match); setShowDeleteModal(true); }} className="btn btn-ghost btn-sm text-red-400" title="Delete">
                    <MdDelete />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
              {editingMatch ? 'Edit Match' : 'Schedule New Match'}
            </h3>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Date *</label>
                  <input type="date" value={form.Date} onChange={(e) => setForm({ ...form, Date: e.target.value })} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Time *</label>
                  <input type="time" value={form.Time} onChange={(e) => setForm({ ...form, Time: e.target.value })} className="form-input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Home Team *</label>
                  <select value={form.HomeTeamID} onChange={(e) => setForm({ ...form, HomeTeamID: e.target.value })} className="form-select" required>
                    <option value="">Select</option>
                    {teams.map((t) => <option key={t.TeamID} value={t.TeamID}>{t.TeamName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Away Team *</label>
                  <select value={form.AwayTeamID} onChange={(e) => setForm({ ...form, AwayTeamID: e.target.value })} className="form-select" required>
                    <option value="">Select</option>
                    {teams.filter((t) => String(t.TeamID) !== String(form.HomeTeamID)).map((t) => (
                      <option key={t.TeamID} value={t.TeamID}>{t.TeamName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">League</label>
                <select value={form.LeagueID} onChange={(e) => setForm({ ...form, LeagueID: e.target.value })} className="form-select">
                  <option value="">Friendly</option>
                  {leagues.map((l) => <option key={l.LeagueID} value={l.LeagueID}>{l.LeagueName}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Referee *</label>
                <input type="text" value={form.Referee} onChange={(e) => setForm({ ...form, Referee: e.target.value })} className="form-input" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingMatch ? 'Update Match' : 'Schedule Match'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Result Modal */}
      {showResultModal && resultMatch && (
        <div className="modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
              Record Match Result
            </h3>
            <div className="text-center mb-4">
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                <span className="font-semibold text-white">{resultMatch.HomeTeamName}</span>
                {' vs '}
                <span className="font-semibold text-white">{resultMatch.AwayTeamName}</span>
              </p>
            </div>
            <form onSubmit={handleRecordResult} className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <label className="form-label text-center block">{resultMatch.HomeTeamName} Goals</label>
                  <input
                    type="number" min="0" value={resultForm.HomeGoals}
                    onChange={(e) => setResultForm({ ...resultForm, HomeGoals: e.target.value })}
                    className="form-input text-center text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  />
                </div>
                <div className="text-center">
                  <label className="form-label text-center block">{resultMatch.AwayTeamName} Goals</label>
                  <input
                    type="number" min="0" value={resultForm.AwayGoals}
                    onChange={(e) => setResultForm({ ...resultForm, AwayGoals: e.target.value })}
                    className="form-input text-center text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  />
                </div>
              </div>
              <p className="text-xs text-center" style={{ color: '#64748b' }}>
                Winner will be determined automatically. Standings will be recalculated.
              </p>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-success flex-1">Save Result</button>
                <button type="button" onClick={() => setShowResultModal(false)} className="btn btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingMatch && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>Delete Match</h3>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>
              Delete match <span className="text-white font-semibold">{deletingMatch.HomeTeamName} vs {deletingMatch.AwayTeamName}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="btn btn-danger flex-1">Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
