import { useState, useRef, useEffect } from 'react';
import { User, Key, LogOut } from 'lucide-react';

export default function UserMenu({ user, onProfile, onPassword, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <span className="hidden sm:inline text-gray-700 dark:text-gray-300">{user?.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-xl z-[100]">
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-1">
            {user?.email}
          </div>
          <button onClick={() => { onProfile(); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-2">
            <User className="w-4 h-4" />
            Update Profile
          </button>
          <button onClick={() => { onPassword(); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-2">
            <Key className="w-4 h-4" />
            Change Password
          </button>
          <button onClick={async () => { await onLogout(); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
