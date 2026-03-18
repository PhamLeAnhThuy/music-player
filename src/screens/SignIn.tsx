import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractUserIdFromLoginResponse, loginUser, setStoredUserId } from '../lib/api';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginUser(email.trim(), password);
      const userId = extractUserIdFromLoginResponse(response);

      if (userId) {
        setStoredUserId(userId);
      }

      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[480px] flex flex-col gap-8">
        <div className="flex items-center justify-between w-full">
          <div className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight flex-1 text-center pr-12">Sign In</h2>
        </div>
        
        <div className="@container w-full">
          <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-[240px] shadow-2xl shadow-primary/10 border border-primary/5" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA23Hh_a30SZZbuHI5Yy0O4x_iKn9vaZz4RrzKHOFbk6BPu105pHYZoGRZ_SdSKowAisLyd1oUdWrL_6-p7EAj7unn3T2nfPlhA9ULskYKyAmZeKOnPgXHgw4rmYDfc0hS_2EhimjSwknWJ9bZwuaac3faIGth4d7D_8g0XDlXKEsGb15Xein68K9U1YzYboD1lzN8uOctmDAxg9VCTbHJAWe5v82zhbG0mIj0eowuBRg-1V8Y-WlEchC2d8CNgyQppqjDSh3aOXxc")' }}>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-4xl font-bold leading-tight">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal">The music is waiting for you</p>
        </div>

        <form className="flex flex-col gap-6 w-full" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-100 text-sm font-semibold tracking-wide uppercase">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
              <input
                className="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 h-14 placeholder:text-slate-400 pl-12 pr-4 text-base font-normal"
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-100 text-sm font-semibold tracking-wide uppercase">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
              <input
                className="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 h-14 placeholder:text-slate-400 pl-12 pr-12 text-base font-normal"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">visibility</span>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-primary text-sm font-medium hover:underline">Forgot password?</Link>
            </div>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 disabled:opacity-60 text-background-dark font-bold text-lg h-14 rounded-full transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Login to My Music'}
          </button>
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </form>

        <div className="flex flex-col gap-4 w-full">
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-200 dark:border-primary/10"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-slate-200 dark:border-primary/10"></div>
          </div>
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center h-12 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors">
              <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxGVf9lgcur4H4XByxGhqSlt33qKqhLOQ_W2EBQRBIhxdDBjpS-P8pExH6RaMmgJ_SwH-VY7ExOtxiUDB0lLSxgmYFKmluTkdB5IIkYYRU-2P8GHWOpIUbk-QavAVIbnOaZZtVhlNqd6j_tVqaL6fQyG4CI-2lJy5vrBy7kfelMaYdOy1UrM84v1WsSaW_s9igWCbXaS08qWYp_Re9yF9ZGM2MDtYuP7TriqXhGF80VcCkZAxgnK5Howi_ohIPaicOBASUWts9KSI" />
            </button>
            <button className="flex-1 flex items-center justify-center h-12 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors">
              <img alt="Apple" className="w-5 h-5 dark:invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC99qAhYXaidsUBfaUqAGaSyd_9V2Qw6r7kJZ3jgxkrZdZV84Hl3BcLutdFv2c_pDg0lDZH-55ay_CRAn2meioGrL8HQL89p2G4zkm9K_uqFByOV2HKmNWe7KJR67jdnT5092EZq3MBQfkBnQADUKAdWzauSmLE-bQ6hk_ntdWnzHhepdtRxULt1IxPXEcVpqTAMI_Bwf1huKLw7pXPcNYYp_mTAfgD6qr5sdY4AjmeAnTYcZAAwbHbhW19OOn7kWKD172J2p5WJSU" />
            </button>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-slate-600 dark:text-slate-400 text-base">
            New to the platform? 
            <Link to="/create-account" className="text-primary font-bold hover:underline ml-1">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
