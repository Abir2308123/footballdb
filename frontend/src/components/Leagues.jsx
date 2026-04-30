// Leagues Management page
import { useState, useEffect } from 'react';
import { leagueAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdEmojiEvents } from 'react-icons/md';

const emptyForm = { LeagueName: '', Country: '', UEFACoefficient: '' };

export default function Leagues() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await leagueAPI.getAll();
      setLeagues(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await leagueAPI.update(editing.LeagueID, form);
        toast.success('League updated');
      } else {
        await leagueAPI.create(form);
        toast.success('League created');
      }
      setShowModal(false); setEditing(null); setForm(emptyForm); loadData();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (l) => {
    setEditing(l);
    setForm({ LeagueName: l.LeagueName, Country: l.Country, UEFACoefficient: l.UEFACoefficient });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await leagueAPI.delete(deleting.LeagueID);
      toast.success('League deleted');
      setShowDeleteModal(false); setDeleting(null); loadData();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 page-enter">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 page-enter">
      <div className="flex justify-between items-center">
        <p className="text-sm" style={{ color: '#64748b' }}>{leagues.length} leagues</p>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }} className="btn btn-primary" id="add-league-btn">
          <MdAdd /> Add League
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagues.map((l) => (
          <div key={l.LeagueID} className="glass-card p-5 stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <MdEmojiEvents style={{ color: '#fbbf24', fontSize: '1.25rem' }} />
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(l)} className="btn btn-ghost btn-sm"><MdEdit /></button>
                <button onClick={() => { setDeleting(l); setShowDeleteModal(true); }} className="btn btn-ghost btn-sm text-red-400"><MdDelete /></button>
              </div>
            </div>
            <h4 className="font-bold text-base mb-1" style={{ color: '#f1f5f9', fontFamily: 'var(--font-heading)' }}>{l.LeagueName}</h4>
            <p className="text-sm mb-3" style={{ color: '#94a3b8' }}>📍 {l.Country}</p>
            <div className="pt-3" style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
              <p className="text-xs" style={{ color: '#64748b' }}>UEFA Coefficient</p>
              <p className="text-lg font-bold" style={{ color: '#f59e0b', fontFamily: 'var(--font-heading)' }}>
                {l.UEFACoefficient}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
              {editing ? 'Edit League' : 'Add New League'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">League Name *</label>
                <input type="text" value={form.LeagueName} onChange={(e) => setForm({ ...form, LeagueName: e.target.value })} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Country *</label>
                <input type="text" value={form.Country} onChange={(e) => setForm({ ...form, Country: e.target.value })} className="form-input" required />
              </div>
              <div>
                <label className="form-label">UEFA Coefficient</label>
                <input type="number" step="0.01" value={form.UEFACoefficient} onChange={(e) => setForm({ ...form, UEFACoefficient: e.target.value })} className="form-input" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{editing ? 'Update' : 'Add League'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && deleting && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>Delete League</h3>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>Delete <span className="text-white font-semibold">{deleting.LeagueName}</span>?</p>
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
