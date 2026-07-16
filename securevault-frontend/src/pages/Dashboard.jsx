import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { vaultApi } from '../api/vault';
import { auditApi } from '../api/audit';
import VaultItemCard from '../components/VaultItemCard';
import AddVaultItemModal from '../components/AddVaultItemModal';
import VerifyPinModal from '../components/VerifyPinModal';
import ShareModal from '../components/ShareModal';
import UpdateProfileModal from '../components/UpdateProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import AuditLogPanel from '../components/AuditLogPanel';
import UserMenu from '../components/UserMenu';
import { Shield, Search, Plus, Sun, Moon, FolderOpen, Share2, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('vault');
  const [auditLogCount, setAuditLogCount] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [revealedDetails, setRevealedDetails] = useState({});
  const [onPinSuccess, setOnPinSuccess] = useState(null);
  const [pinTargetItemId, setPinTargetItemId] = useState(null);
  const [itemPinVerified, setItemPinVerified] = useState({});

  const fetchItems = useCallback(async () => {
    try {
      setError('');
      const res = await vaultApi.getAll(search || undefined);
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vault items');
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchAuditCount = useCallback(async () => {
    try {
      const res = await auditApi.getAll();
      setAuditLogCount(res.data.length);
    } catch {}
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchAuditCount();
  }, [fetchAuditCount]);

  const doReveal = async (item) => {
    try {
      const res = await vaultApi.reveal(item.id);
      setRevealedDetails((prev) => ({
        ...prev,
        [item.id]: {
          username: res.data.username,
          password: res.data.plaintextPassword,
        },
      }));
      setTimeout(() => {
        setRevealedDetails((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }, 15000);
      return res.data;
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reveal password');
      return null;
    }
  };

  const requirePinThen = (item, action) => {
    if (itemPinVerified[item.id]) {
      action();
      return;
    }
    setOnPinSuccess(() => action);
    setPinTargetItemId(item.id);
    setShowPinModal(true);
  };

  const handleReveal = (item) => {
    requirePinThen(item, async () => {
      await doReveal(item);
    });
  };

  const handleCopy = async (item) => {
    const detail = revealedDetails[item.id];
    if (detail && detail.password) {
      await navigator.clipboard.writeText(detail.password);
      try { await vaultApi.copy(item.id); } catch {}
      return;
    }
    requirePinThen(item, async () => {
      try {
        const res = await vaultApi.reveal(item.id);
        const pw = res.data.plaintextPassword;
        await navigator.clipboard.writeText(pw);
        try { await vaultApi.copy(item.id); } catch {}
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to copy password');
      }
    });
  };

  const handleEdit = (item) => {
    requirePinThen(item, () => {
      setEditingItem(item);
      setShowAddModal(true);
    });
  };

  const handleShare = (item) => {
    requirePinThen(item, () => {
      setShowShareModal(item);
    });
  };

  const handleDelete = (item) => {
    requirePinThen(item, () => {
      if (!confirm('Delete this vault item?')) return;
      vaultApi.delete(item.id)
        .then(() => {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          fetchAuditCount();
        })
        .catch((err) => alert(err.response?.data?.message || 'Failed to delete'));
    });
  };

  const handleAddOrEdit = async (data) => {
    try {
      if (editingItem) {
        const res = await vaultApi.update(editingItem.id, data);
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? res.data : i)));
      } else {
        const res = await vaultApi.create(data);
        setItems((prev) => [res.data, ...prev]);
        fetchAuditCount();
      }
      setShowAddModal(false);
      setEditingItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleGeneratePassword = async () => {
    try {
      const res = await vaultApi.generatePassword();
      return res.data.password;
    } catch {
      return Array(20).fill().map(() => '!@#$%^&*()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 72)]).join('');
    }
  };

  const totalItems = items.length;
  const sharedItems = items.filter((i) => i.accessLevel === 'SHARED').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* Nav Bar */}
      <nav className="relative z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">SecureVault</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="icon-btn" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{user?.email}</span>
            <UserMenu user={user} onProfile={() => setShowProfileModal(true)} onPassword={() => setShowPasswordModal(true)} onLogout={logout} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Vault Items</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sharedItems}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Shared Items</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{auditLogCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recent Activity</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'vault'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Vault
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Audit Log
          </button>
        </div>

        {activeTab === 'vault' ? (
          <>
            {/* Search + Add */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Search vault items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => { setEditingItem(null); setShowAddModal(true); }}
                className="btn-primary whitespace-nowrap flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Password
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
            )}

            {loading ? (
              <div className="text-center py-16 text-gray-500">Loading vault...</div>
            ) : items.length === 0 ? (
              <div className="card text-center py-16">
                <Shield className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Your vault is empty</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Add your first password to get started</p>
                <button onClick={() => { setEditingItem(null); setShowAddModal(true); }} className="btn-primary">Add Password</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                  <VaultItemCard
                    key={item.id}
                    item={item}
                    revealedDetail={revealedDetails[item.id]}
                    onReveal={() => handleReveal(item)}
                    onCopy={() => handleCopy(item)}
                    onEdit={() => handleEdit(item)}
                    onShare={() => handleShare(item)}
                    onDelete={() => handleDelete(item)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <AuditLogPanel />
        )}

        {showAddModal && (
          <AddVaultItemModal item={editingItem} onClose={() => { setShowAddModal(false); setEditingItem(null); }} onSubmit={handleAddOrEdit} onGeneratePassword={handleGeneratePassword} />
        )}

        {showPinModal && (
          <VerifyPinModal
            itemId={pinTargetItemId}
            onClose={() => { setShowPinModal(false); setOnPinSuccess(null); setPinTargetItemId(null); }}
            onSuccess={() => {
              setShowPinModal(false);
              if (pinTargetItemId) {
                setItemPinVerified((prev) => ({ ...prev, [pinTargetItemId]: true }));
              }
              if (onPinSuccess) { setTimeout(onPinSuccess, 100); setOnPinSuccess(null); }
              setPinTargetItemId(null);
            }}
          />
        )}

        {showShareModal && <ShareModal item={showShareModal} onClose={() => setShowShareModal(null)} />}
        {showProfileModal && <UpdateProfileModal onClose={() => setShowProfileModal(false)} />}
        {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      </main>
    </div>
  );
}
