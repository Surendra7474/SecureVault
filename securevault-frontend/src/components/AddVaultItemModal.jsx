import { useState, useEffect } from 'react';
import { Key, Lock, Globe } from 'lucide-react';

export default function AddVaultItemModal({ item, onClose, onSubmit, onGeneratePassword }) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessLevel, setAccessLevel] = useState('PRIVATE');
  const [itemPin, setItemPin] = useState('');
  const [verificationPin, setVerificationPin] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setUsername(item.username || '');
      setAccessLevel(item.accessLevel || 'PRIVATE');
      setPassword('');
    }
  }, [item]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const pw = await onGeneratePassword();
      setPassword(pw);
    } finally {
      setGenerating(false);
    }
  };

  const isEditing = !!item;
  const originalAccessLevel = item?.accessLevel || null;

  // Show item PIN only when going TO Private for the first time (create or switch)
  const showItemPin = accessLevel === 'PRIVATE' && (!isEditing || originalAccessLevel !== 'PRIVATE');
  // Show verification PIN only when going TO Shared for the first time (create or switch)
  const showVerificationPin = accessLevel === 'SHARED' && (!isEditing || originalAccessLevel !== 'SHARED');

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      title,
      username,
      password: password || undefined,
      accessLevel,
      itemPin: showItemPin ? itemPin : undefined,
      verificationPin: showVerificationPin ? verificationPin : undefined,
    };
    onSubmit(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-6">{isEditing ? 'Edit Password' : 'Add Password'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Google Account" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username / Email</label>
            <input type="text" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="you@gmail.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="flex gap-2">
              <input type="text" className="input-field flex-1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEditing ? 'Leave blank to keep current' : 'Enter password'} required={!isEditing} />
              <button type="button" onClick={handleGenerate} disabled={generating} className="btn-outline text-xs py-2 px-3 whitespace-nowrap">
                <Key className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Access Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAccessLevel('PRIVATE')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  accessLevel === 'PRIVATE'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <Lock className="w-4 h-4" />
                Private
              </button>
              <button
                type="button"
                onClick={() => setAccessLevel('SHARED')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  accessLevel === 'SHARED'
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <Globe className="w-4 h-4" />
                Shared
              </button>
            </div>
          </div>

          {showItemPin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Set an item PIN (4-6 digits, required)</label>
              <input
                type="password"
                className="input-field"
                value={itemPin}
                onChange={(e) => setItemPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="4-6 digit PIN"
                maxLength={6}
                required
              />
            </div>
          )}

          {showVerificationPin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Verify your account PIN to create this shared item</label>
              <input
                type="password"
                className="input-field"
                value={verificationPin}
                onChange={(e) => setVerificationPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Your account PIN"
                maxLength={6}
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{isEditing ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
