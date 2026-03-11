import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('demo@solar.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      if (email && password) {
        const userData = {
          email,
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          installationId: 'VIT-2024-001',
        };
        login(userData);
        navigate('/');
      } else {
        setError('Please fill in all fields');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-void-900 dark:to-void-800 p-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 text-slate-600 dark:text-void-300 hover:text-solar-600 dark:hover:text-solar-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-void-700"
        aria-label="Toggle Theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/80 dark:bg-void-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-void-700">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-solar-500 animate-pulse" />
              <div className="absolute inset-[-8px] rounded-full border border-dashed border-solar-500/50 animate-spin-slow" />
            </div>
            <span className="font-display text-3xl font-extrabold text-solar-600 dark:text-solar-400 tracking-[3px]">
              {/* HELIO */}
              VIT-Charge
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-slate-600 dark:text-void-300 text-sm mt-1">
            {/* Sign in to access your solar dashboard */}
            Sign in to access your Smart Campus dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-energy-rose/10 border border-energy-rose/30 rounded-lg">
            <div className="text-energy-rose text-sm font-medium">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-void-300 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-void-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@solar.com"
                className="w-full bg-slate-100 dark:bg-void-900 border border-slate-300 dark:border-void-700 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-solar-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-void-400"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-void-300 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-void-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100 dark:bg-void-900 border border-slate-300 dark:border-void-700 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-solar-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-void-400"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                className="text-xs text-solar-600 dark:text-solar-400 hover:text-solar-700 dark:hover:text-solar-300 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Demo Credentials Info */}
          <div className="p-4 bg-solar-50 dark:bg-solar-500/10 border border-solar-200 dark:border-solar-500/30 rounded-lg">
            <div className="text-xs text-slate-700 dark:text-void-100 font-mono">
              <div className="font-semibold mb-1 text-solar-600 dark:text-solar-400">Demo Credentials</div>
              <div>Email: demo@solar.com</div>
              <div>Password: password123</div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-solar-500 hover:bg-solar-600 disabled:opacity-60 disabled:cursor-not-allowed text-white dark:text-void-900 font-display font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-slate-600 dark:text-void-300 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-solar-600 dark:text-solar-400 hover:text-solar-700 dark:hover:text-solar-300 font-semibold transition-colors"
              >
                Sign up here
              </button>
            </span>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="text-xs text-slate-500 dark:text-void-400 font-mono space-y-1">
            <div>Questions? Contact support@helio-solar.com</div>
            <div className="pt-2 flex gap-4 justify-center">
              <a href="#" className="hover:text-slate-700 dark:hover:text-void-200 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-700 dark:hover:text-void-200 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-700 dark:hover:text-void-200 transition-colors">Help</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}