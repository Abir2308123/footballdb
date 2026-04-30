// Venues Management page
import { useState, useEffect } from 'react';
import { venueAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdStadium } from 'react-icons/md';

const emptyForm = { Name: '', City: '', Country: '', Capacity: '' };

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await venueAPI.getAll();
      setVenues(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, Capacity: parseInt(form.Capacity) };
    try {
      if (editing) {
        await venueAPI.update(editing.VenueID, data);
        toast.success('Venue updated');
      } else {
        await venueAPI.create(data);
        toast.success('Venue added');
      }
      setShowModal(false); setEditing(null); setForm(emptyForm); loadData();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (v) => {
    setEditing(v);
    setForm({ Name: v.Name, City: v.City, Country: v.Country, Capacity: v.Capacity });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await venueAPI.delete(deleting.VenueID);
      toast.success('Venue deleted');
      setShowDeleteModal(false); setDeleting(null); loadData();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 page-enter">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 page-enter">
      <div className="flex justify-between items-center">
        <p className="text-sm" style={{ color: '#64748b' }}>{venues.length} venues registered</p>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }} className="btn btn-primary" id="add-venue-btn">
          <MdAdd /> Add Venue
        </button>
      </div>

      {/* Venue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((v) => (
          <div key={v.VenueID} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                <MdStadium style={{ color: '#a78bfa', fontSize: '1.25rem' }} />
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(v)} className="btn btn-ghost btn-sm"><MdEdit /></button>
                <button onClick={() => { setDeleting(v); setShowDeleteModal(true); }} className="btn btn-ghost btn-sm text-red-400"><MdDelete /></button>
              </div>
            </div>
            <h4 className="font-bold text-base mb-1" style={{ color: '#f1f5f9', fontFamily: 'var(--font-heading)' }}>{v.Name}</h4>
            <p className="text-sm" style={{ color: '#94a3b8' }}>{v.City}, {v.Country}</p>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
              <p className="text-xs" style={{ color: '#64748b' }}>Capacity</p>
              <p className="text-lg font-bold" style={{ color: '#3b82f6', fontFamily: 'var(--font-heading)' }}>
                {v.Capacity?.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
              {editing ? 'Edit Venue' : 'Add New Venue'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Venue Name *</label>
                <input type="text" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} className="form-input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">City *</label>
                  <input type="text" value={form.City} onChange={(e) => setForm({ ...form, City: e.target.value })} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Country *</label>
                  <input type="text" value={form.Country} onChange={(e) => setForm({ ...form, Country: e.target.value })} className="form-input" required />
                </div>
              </div>
              <div>
                <label className="form-label">Capacity *</label>
                <input type="number" value={form.Capacity} min="1" onChange={(e) => setForm({ ...form, Capacity: e.target.value })} className="form-input" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{editing ? 'Update' : 'Add Venue'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deleting && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>Delete Venue</h3>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>
              Delete <span className="text-white font-semibold">{deleting.Name}</span>?
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
