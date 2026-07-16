import { useState } from 'react';
import { vaultApi } from '../api/vault';
import { Share2 } from 'lucide-react';

export default function ShareModal({ item, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await vaultApi.share(item.id, email);
      setSuccess(`Shared "${item.title}" with ${email}`);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Share Vault Item</h2>
        </div>
        <p className="text-sm text-gray-400 mb-6">Share "{item.title}" with another SecureVault user</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Close</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Sharing...' : 'Share'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}