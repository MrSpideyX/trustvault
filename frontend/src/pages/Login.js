import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate(user.is_admin ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
          <img 
            src="https://customer-assets.emergentagent.com/job_gaming-hub-471/artifacts/xqaigfjd_trustvault%20logo.png" 
            alt="Trust Vault" 
            className="h-10 w-auto"
          />
        </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-white/50">Sign in to your account</p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8">
          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            variant="outline"
            className="w-full h-12 border-white/20 mb-6"
            data-testid="google-login-btn"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0a0a] text-white/50">or</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="bg-black/50 border-white/10 h-12"
                required
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="bg-black/50 border-white/10 h-12"
                required
                data-testid="password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-skew bg-[#00F0FF] text-black h-12 font-bold uppercase tracking-wider"
              data-testid="login-btn"
            >
              <span className="flex items-center justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </span>
            </Button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00F0FF] hover:underline" data-testid="register-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
