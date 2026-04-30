// Players Management page - CRUD with team transfer, filtering, free agents
import { useState, useEffect } from 'react';
import { playerAPI, teamAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdSwapHoriz } from 'react-icons/md';

const positions = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];
const positionClass = { Forward: 'position-fw', Midfielder: 'position-mf', Defender: 'position-df', Goalkeeper: 'position-gk' };
const emptyForm = { Name: '', Age: '', Position: '', JerseyNo: '', TeamID: '' };

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [deletingPlayer, setDeletingPlayer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterTeam, setFilterTeam] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [filterTeam, filterPosition]);

  const loadData = async () => {
    try {
      const params = {};
      if (filterTeam) params.teamId = filterTeam;
      if (filterPosition) params.position = filterPosition;
      const [playersRes, teamsRes] = await Promise.all([
        playerAPI.getAll(params),
        teamAPI.getAll(),
      ]);
      setPlayers(playersRes.data);
      setTeams(teamsRes.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, Age: parseInt(form.Age), JerseyNo: parseInt(form.JerseyNo) };
    try {
      if (editingPlayer) {
        await playerAPI.update(editingPlayer.PlayerID, data);
        toast.success('Player updated successfully');
      } else {
        await playerAPI.create(data);
        toast.success('Player added successfully');
      }
      setShowModal(false);
      setEditingPlayer(null);
      setForm(emptyForm);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setForm({
      Name: player.Name,
      Age: player.Age,
      Position: player.Position,
      JerseyNo: player.JerseyNo,
      TeamID: player.TeamID || '',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await playerAPI.delete(deletingPlayer.PlayerID);
      toast.success('Player deleted');
      setShowDeleteModal(false);
      setDeletingPlayer(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredPlayers = players.filter((p) =>
    p.Name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 lg:p-6 page-enter">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
              id="search-players"
            />
          </div>
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="form-select"
            id="filter-team"
          >
            <option value="">All Teams</option>
            <option value="null">Free Agents</option>
            {teams.map((t) => (
              <option key={t.TeamID} value={t.TeamID}>{t.TeamName}</option>
            ))}
          </select>
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="form-select"
            id="filter-position"
          >
            <option value="">All Positions</option>
            {positions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { setEditingPlayer(null); setForm(emptyForm); setShowModal(true); }}
          className="btn btn-primary"
          id="add-player-btn"
        >
          <MdAdd /> Add Player
        </button>
      </div>

      {/* Players Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Position</th>
                <th>Jersey #</th>
                <th>Team</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8" style={{ color: '#64748b' }}>
                    No players found
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.PlayerID}>
                    <td className="font-mono text-xs" style={{ color: '#64748b' }}>
                      #{player.PlayerID}
                    </td>
                    <td>
                      <span className="font-semibold" style={{ color: '#f1f5f9' }}>
                        {player.Name}
                      </span>
                    </td>
                    <td>{player.Age}</td>
                    <td>
                      <span className={`badge ${positionClass[player.Position] || 'badge-gray'}`}>
                        {player.Position}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono font-bold" style={{ color: '#e2e8f0' }}>
                        #{player.JerseyNo}
                      </span>
                    </td>
                    <td>
                      {player.TeamName ? (
                        player.TeamName
                      ) : (
                        <span className="badge badge-yellow">Free Agent</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(player)} className="btn btn-ghost btn-sm" title="Edit / Transfer">
                          <MdEdit />
                        </button>
                        <button
                          onClick={() => { setDeletingPlayer(player); setShowDeleteModal(true); }}
                          className="btn btn-ghost btn-sm text-red-400"
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
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Player Name *</label>
                <input
                  type="text" value={form.Name}
                  onChange={(e) => setForm({ ...form, Name: e.target.value })}
                  className="form-input" required id="player-name-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Age (16-45) *</label>
                  <input
                    type="number" value={form.Age} min="16" max="45"
                    onChange={(e) => setForm({ ...form, Age: e.target.value })}
                    className="form-input" required
                  />
                </div>
                <div>
                  <label className="form-label">Jersey # (1-99) *</label>
                  <input
                    type="number" value={form.JerseyNo} min="1" max="99"
                    onChange={(e) => setForm({ ...form, JerseyNo: e.target.value })}
                    className="form-input" required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Position *</label>
                <select
                  value={form.Position}
                  onChange={(e) => setForm({ ...form, Position: e.target.value })}
                  className="form-select" required
                >
                  <option value="">Select Position</option>
                  {positions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">
                  Team {editingPlayer && <span className="text-blue-400 text-xs ml-1">(change to transfer)</span>}
                </label>
                <select
                  value={form.TeamID}
                  onChange={(e) => setForm({ ...form, TeamID: e.target.value })}
                  className="form-select"
                >
                  <option value="">Free Agent (No Team)</option>
                  {teams.map((t) => (
                    <option key={t.TeamID} value={t.TeamID}>{t.TeamName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingPlayer ? 'Update Player' : 'Add Player'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingPlayer && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
              Delete Player
            </h3>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>
              Are you sure you want to delete <span className="font-semibold text-white">{deletingPlayer.Name}</span>?
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
