import { Eye, EyeOff, Copy, Pencil, Share2, Trash2, Lock } from 'lucide-react';
import { useState } from 'react';

export default function VaultItemCard({ item, revealedDetail, onReveal, onCopy, onEdit, onShare, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);

  const isRevealed = !!revealedDetail;
  const displayPassword = isRevealed ? revealedDetail.password : '••••••••';
  const displayUsername = isRevealed ? revealedDetail.username : '••••••••';

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{item.title}</h3>
            {item.hasItemPin && (
              <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" title="Item PIN protected" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-mono mt-0.5">{displayUsername}</p>
        </div>
        <span className={`badge ${item.accessLevel === 'SHARED' ? 'badge-yellow' : 'badge-green'} ml-2 shrink-0`}>
          {item.accessLevel}
        </span>
      </div>

      <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400 truncate border border-gray-200 dark:border-gray-700/50">
        <span className={isRevealed ? 'text-emerald-600 dark:text-emerald-400' : ''}>{displayPassword}</span>
      </div>

      <div className="flex items-center gap-1 pt-3 border-t border-gray-200 dark:border-gray-700/50">
        <button
          onClick={() => { if (isRevealed) { setShowPassword(!showPassword); } else { onReveal(); } }}
          className="icon-btn"
          title={isRevealed ? (showPassword ? 'Hide' : 'Show') : 'Reveal'}
        >
          {isRevealed && showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button onClick={onCopy} className="icon-btn" title="Copy">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={onEdit} className="icon-btn" title="Edit">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onShare} className="icon-btn" title="Share">
          <Share2 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="icon-btn hover:text-red-500" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
