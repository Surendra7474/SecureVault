import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Shield, CheckCircle } from 'lucide-react';

export default function ResetPasswordConfirm() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Invalid reset token. Please request a new reset link.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The token may be expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <Shield className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">SecureVault</h1>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 justify-center">
            <CheckCircle className="w-4 h-4" />
            Your password has been reset successfully.
          </div>
          <Link to="/login" className="btn-primary inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">SecureVault</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Set a new password</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
          <button type="submit" disabled={submitting || !token} className="btn-primary w-full">
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
