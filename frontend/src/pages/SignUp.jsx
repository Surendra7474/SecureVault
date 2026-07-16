import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, UserPlus } from 'lucide-react';

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', password: '', pin: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.pin.length < 4 || form.pin.length > 6 || !/^\d{4,6}$/.test(form.pin)) {
      setError('PIN must be 4-6 digits');
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">SecureVault</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create your secure account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input type="text" className="input-field" value={form.name} onChange={update('name')} placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input type="tel" className="input-field" value={form.phoneNumber} onChange={update('phoneNumber')} placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input type="password" className="input-field" value={form.password} onChange={update('password')} placeholder="Min. 8 characters" required minLength={8} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN (4-6 digits)</label>
            <input type="password" className="input-field" value={form.pin} onChange={update('pin')} placeholder="****" required maxLength={6} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Required to reveal passwords in your vault</p>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" />
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
