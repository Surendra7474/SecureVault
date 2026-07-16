import { useState, useEffect } from 'react';
import { userApi } from '../api/user';
import { useAuth } from '../contexts/AuthContext';

export default function UpdateProfileModal({ onClose }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await userApi.updateProfile({ name, phoneNumber, currentPin, newPin: newPin || undefined });
      setSuccess('Profile updated successfully');
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-6">Update Profile</h2>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
            <input type="tel" className="input-field" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current PIN (4-6 digits)</label>
            <input type="password" className="input-field" value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter your current PIN" maxLength={6} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New PIN (optional, 4-6 digits)</label>
            <input type="password" className="input-field" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Leave blank to keep current" maxLength={6} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
