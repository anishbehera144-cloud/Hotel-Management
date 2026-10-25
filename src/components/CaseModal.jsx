import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, X, Trash2, AlertCircle, Layers, Check } from 'lucide-react';

export default function CaseModal() {
  const { newCaseModalOpen, setNewCaseModalOpen, createCase, departments, cases } = useApp();

  const [roomNumber, setRoomNumber] = useState('412');
  const [guestName, setGuestName] = useState('Lord Alistair Sterling');
  const [category, setCategory] = useState('VIP_REQUEST');
  const [priority, setPriority] = useState('HIGH');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('Front Desk');
  const [initialNote, setInitialNote] = useState('');

  // Subtasks list for the master case
  const [subtasks, setSubtasks] = useState([
    { title: 'Deliver extra goose-down pillows', departmentId: 'housekeeping', instructions: 'Hypoallergenic sealed' },
    { title: 'Pre-cool suite AC to 19°C', departmentId: 'maintenance', instructions: 'Check thermostat sensor' },
  ]);

  if (!newCaseModalOpen) return null;

  // Duplicate warning detection
  const potentialDuplicate = cases.find(
    c => c.roomNumber === roomNumber && c.status !== 'CLOSED' && c.category === category
  );

  const addSubtask = () => {
    setSubtasks([
      ...subtasks,
      { title: '', departmentId: 'housekeeping', instructions: '' },
    ]);
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index, field, value) => {
    const updated = [...subtasks];
    updated[index][field] = value;
    setSubtasks(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createCase({
      roomNumber,
      guestName,
      category,
      title,
      priority,
      subtasksData: subtasks.filter(s => s.title.trim()),
      channel,
      initialNote,
    });

    setNewCaseModalOpen(false);
    setTitle('');
    setInitialNote('');
  };

  return (
    <div className="modal-overlay" onClick={() => setNewCaseModalOpen(false)}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Layers size={20} color="var(--accent-gold)" />
            <span>Create Master Guest Case & Linked Subtasks (FR-CASE-03)</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setNewCaseModalOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {potentialDuplicate && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.78rem',
                  color: 'var(--accent-gold-light)',
                }}
              >
                <AlertCircle size={18} />
                <div>
                  <strong>Potential Duplicate Detected (FR-CASE-04):</strong> Room {roomNumber} already has open case{' '}
                  <strong>{potentialDuplicate.id}</strong> in category {category}. System will link records without deleting history.
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Room / Location:</label>
                <input
                  type="text"
                  className="form-input"
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Guest Name:</label>
                <input
                  type="text"
                  className="form-input"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category:</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="VIP_REQUEST">VIP & High Priority</option>
                  <option value="ROOM_CLEANING">Housekeeping / Amenities</option>
                  <option value="MAINTENANCE_HVAC">Engineering & Repairs</option>
                  <option value="IN_ROOM_DINING">In-Room Dining / F&B</option>
                  <option value="GENERAL_CONCIERGE">Concierge & Luggage</option>
                  <option value="EMERGENCY">Emergency / Security</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority:</label>
                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="LOW">Low (Planned)</option>
                  <option value="NORMAL">Normal (Standard)</option>
                  <option value="HIGH">High (Priority)</option>
                  <option value="URGENT">Urgent (Immediate)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Channel (FR-CASE-05):</label>
                <select className="form-select" value={channel} onChange={e => setChannel(e.target.value)}>
                  <option value="Front Desk">Front Desk (In-Person)</option>
                  <option value="Phone Call">Guest Phone Call</option>
                  <option value="In-Room Tablet">In-Room Tablet Portal</option>
                  <option value="QR Mobile Portal">Room QR Web Session</option>
                  <option value="WhatsApp">VIP Guest Concierge</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Master Case Title / Summary:</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. VIP Arrival: Extra amenities, AC pre-cooling, and dietary check"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Subtasks Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#fff' }}>
                  Linked Departmental Subtasks ({subtasks.length}):
                </label>
                <button type="button" className="btn btn-outline btn-sm" onClick={addSubtask}>
                  <PlusCircle size={14} /> Add Department Task
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {subtasks.map((st, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 3fr auto',
                      gap: '0.5rem',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Task action description"
                      value={st.title}
                      onChange={e => updateSubtask(i, 'title', e.target.value)}
                      required
                    />

                    <select
                      className="form-select"
                      value={st.departmentId}
                      onChange={e => updateSubtask(i, 'departmentId', e.target.value)}
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name.split(' ')[0]}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Instructions / specs"
                      value={st.instructions}
                      onChange={e => updateSubtask(i, 'instructions', e.target.value)}
                    />

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--status-crimson)' }}
                      onClick={() => removeSubtask(i)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Communication Note:</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Note to attach to initial case timeline..."
                value={initialNote}
                onChange={e => setInitialNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setNewCaseModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Create Case & Dispatch Subtasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
