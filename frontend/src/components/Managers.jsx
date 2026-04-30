// Managers Management page
import { useState, useEffect } from 'react';
import { managerAPI, teamAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdPerson } from 'react-icons/md';

const emptyForm = { Name: '', TeamID: '' };

export default function Managers() {
  const [managers, setManagers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [mRes, tRes] = await Promise.all([managerAPI.getAll(), teamAPI.getAll()]);
      setManagers(mRes.data);
      setTeams(tRes.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await managerAPI.update(editing.ManagerID, form);
        toast.success('Manager updated');
      } else {
        await managerAPI.create(form);
        toast.success('Manager added');
      }
      setShowModal(false); setEditing(null); setForm(emptyForm); loadData();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (m) => {
    setEditing(m);
    setForm({ Name: m.Name, TeamID: m.TeamID || '' });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await managerAPI.delete(deleting.ManagerID);
      toast.success('Manager deleted');
      setShowDeleteModal(false); setDeleting(null); loadData();
    } catch (err) { toast.error(err.message); }
  };

  // Teams without a manager (or the team assigned to the currently editing manager)
  const assignedTeamIds = teams
    .filter((t) => t.ManagerID && (!editing || t.ManagerID !== editing.ManagerID))
    .map((t) => t.TeamID);
  const availableTeams = teams.filter((t) => !assignedTeamIds.includes(t.TeamID));

  if (loading) {
    return (
      <div className="p-4 lg:p-6 page-enter">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 page-enter">
      <div className="flex justify-between items-center">
        <p className="text-sm" style={{ color: '#64748b' }}>{managers.length} managers</p>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }} className="btn btn-primary" id="add-manager-btn">
          <MdAdd /> Add Manager
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Team</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8" style={{ color: '#64748b' }}>No managers</td></tr>
              ) : (
                managers.map((m) => (
                  <tr key={m.ManagerID}>
                    <td className="font-mono text-xs" style={{ color: '#64748b' }}>#{m.ManagerID}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                          <MdPerson style={{ color: '#60a5fa' }} />
                        </div>
                        <span className="font-semibold" style={{ color: '#f1f5f9' }}>{m.Name}</span>
                      </div>
                    </td>
                    <td>{m.TeamName || <span className="badge badge-gray">Unassigned</span>}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(m)} className="btn btn-ghost btn-sm"><MdEdit /></button>
                        <button onClick={() => { setDeleting(m); setShowDeleteModal(true); }} className="btn btn-ghost btn-sm text-red-400"><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
              {editing ? 'Edit Manager' : 'Add New Manager'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Manager Name *</label>
                <input type="text" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Assign to Team</label>
                <select value={form.TeamID} onChange={(e) => setForm({ ...form, TeamID: e.target.value })} className="form-select">
                  <option value="">Unassigned</option>
                  {availableTeams.map((t) => <option key={t.TeamID} value={t.TeamID}>{t.TeamName}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{editing ? 'Update' : 'Add Manager'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && deleting && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>Delete Manager</h3>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>Delete <span className="text-white font-semibold">{deleting.Name}</span>?</p>
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
