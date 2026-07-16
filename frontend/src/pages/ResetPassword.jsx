import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Shield, Mail } from 'lucide-react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">SecureVault</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Reset your password</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 px-4 py-3 rounded-lg mb-6 text-sm">
              If an account with that email exists, a reset link has been sent.
            </div>
            <Link to="/login" className="btn-primary inline-block">Back to Sign In</Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <Link to="/login" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
