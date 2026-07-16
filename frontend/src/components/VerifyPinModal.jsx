import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { vaultApi } from '../api/vault';
import { Shield } from 'lucide-react';

export default function VerifyPinModal({ onClose, onSuccess, itemId }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { verifyPin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      let valid;
      if (itemId) {
        const res = await vaultApi.verifyItemPin(itemId, pin);
        valid = res.data.valid;
      } else {
        valid = await verifyPin(pin);
      }
      if (valid) {
        onSuccess();
      } else {
        setError('Invalid PIN. Please try again.');
        setPin('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Too many failed attempts. Please wait.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">
            {itemId ? 'Verify Item PIN' : 'Verify PIN'}
          </h2>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {itemId ? 'This password is PIN-protected. Enter the PIN to proceed.' : 'Enter your PIN to proceed'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="input-field text-center text-2xl tracking-[0.5em]"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="****"
            maxLength={6}
            required
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={submitting || pin.length < 4} className="btn-primary flex-1">
              {submitting ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
