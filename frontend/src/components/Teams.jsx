// Teams Management page - CRUD operations with league filter
import { useState, useEffect } from 'react';
import { teamAPI, leagueAPI, managerAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList } from 'react-icons/md';

const emptyForm = { TeamName: '', JerseyColor: '', ManagerName: '', LeagueID: '' };

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterLeague, setFilterLeague] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [filterLeague]);

  const loadData = async () => {
    try {
      const params = filterLeague ? { leagueId: filterLeague } : {};
      const [teamsRes, leaguesRes, managersRes] = await Promise.all([
        teamAPI.getAll(params),
        leagueAPI.getAll(),
        managerAPI.getAll(),
      ]);
      setTeams(teamsRes.data);
      setLeagues(leaguesRes.data);
      setManagers(managersRes.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamAPI.update(editingTeam.TeamID, form);
        toast.success('Team updated successfully');
      } else {
        await teamAPI.create(form);
        toast.success('Team created successfully');
      }
      setShowModal(false);
      setEditingTeam(null);
      setForm(emptyForm);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setForm({
      TeamName: team.TeamName,
      JerseyColor: team.JerseyColor,
      ManagerName: team.ManagerName || '',
      LeagueID: team.LeagueID || '',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await teamAPI.delete(deletingTeam.TeamID);
      toast.success('Team deleted successfully');
      setShowDeleteModal(false);
      setDeletingTeam(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredTeams = teams.filter((t) =>
    t.TeamName.toLowerCase().includes(search.toLowerCase())
  );



  if (loading) {
    return (
      <div className="p-4 lg:p-6 page-enter">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 page-enter">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
              id="search-teams"
            />
          </div>
          {/* League Filter */}
          <div className="flex items-center gap-2">
            <MdFilterList className="text-slate-500" />
            <select
              value={filterLeague}
              onChange={(e) => setFilterLeague(e.target.value)}
              className="form-select"
              id="filter-league"
            >
              <option value="">All Leagues</option>
              {leagues.map((l) => (
                <option key={l.LeagueID} value={l.LeagueID}>
                  {l.LeagueName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingTeam(null);
            setForm(emptyForm);
            setShowModal(true);
          }}
          className="btn btn-primary"
          id="add-team-btn"
        >
          <MdAdd /> Add Team
        </button>
      </div>

      {/* Teams Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Team Name</th>
                <th>Jersey Color</th>
                <th>League</th>
                <th>Manager</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: '#64748b' }}>
                    No teams found
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.TeamID}>
                    <td className="font-mono text-xs" style={{ color: '#64748b' }}>
                      #{team.TeamID}
                    </td>
                    <td>
                      <span className="font-semibold" style={{ color: '#f1f5f9' }}>
                        {team.TeamName}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue">{team.JerseyColor}</span>
                    </td>
                    <td>{team.LeagueName || <span className="text-slate-600">—</span>}</td>
                    <td>{team.ManagerName || <span className="text-slate-600">—</span>}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(team)}
                          className="btn btn-ghost btn-sm"
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingTeam(team);
                            setShowDeleteModal(true);
                          }}
                          className="btn btn-ghost btn-sm text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3
              className="text-lg font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}
            >
              {editingTeam ? 'Edit Team' : 'Add New Team'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Team Name *</label>
                <input
                  type="text"
                  value={form.TeamName}
                  onChange={(e) => setForm({ ...form, TeamName: e.target.value })}
                  className="form-input"
                  required
                  id="team-name-input"
                />
              </div>
              <div>
                <label className="form-label">Jersey Color *</label>
                <input
                  type="text"
                  value={form.JerseyColor}
                  onChange={(e) => setForm({ ...form, JerseyColor: e.target.value })}
                  className="form-input"
                  required
                  id="jersey-color-input"
                />
              </div>
              <div>
                <label className="form-label">League</label>
                <select
                  value={form.LeagueID}
                  onChange={(e) => setForm({ ...form, LeagueID: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select League</option>
                  {leagues.map((l) => (
                    <option key={l.LeagueID} value={l.LeagueID}>
                      {l.LeagueName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Manager Name</label>
                <input
                  type="text"
                  placeholder="Enter manager name"
                  value={form.ManagerName}
                  onChange={(e) => setForm({ ...form, ManagerName: e.target.value })}
                  className="form-input"
                  id="manager-name-input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTeam && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3
              className="text-lg font-bold mb-2"
              style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}
            >
              Delete Team
            </h3>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">{deletingTeam.TeamName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="btn btn-danger flex-1">
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
