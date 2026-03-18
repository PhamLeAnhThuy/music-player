import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setStoredUserId, signUpUser } from '../lib/api';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await signUpUser(name.trim(), email.trim(), password);
      if (response.user?.id) {
        setStoredUserId(response.user.id);
      }
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      <div className="flex items-center p-4 pb-2 justify-between">
        <Link to="/" className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Create Account</h2>
      </div>
      
      <div className="flex flex-col px-6 pt-8 pb-4">
        <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[32px] font-bold leading-tight text-left">Join the Beat</h1>
        <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal pt-2">Sign up to start your musical journey</p>
      </div>
      
      <form className="flex flex-col gap-4 px-6 py-2 max-w-[480px] w-full mx-auto" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-none">Full Name</label>
          <div className="relative">
            <input
              className="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary border border-slate-200 dark:border-background-dark/20 bg-white dark:bg-[#1c2620] h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal transition-all"
              placeholder="John Doe"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-none">Email Address</label>
          <div className="relative">
            <input
              className="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary border border-slate-200 dark:border-background-dark/20 bg-white dark:bg-[#1c2620] h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal transition-all"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-none">Password</label>
          <div className="relative group">
            <input
              className="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary border border-slate-200 dark:border-background-dark/20 bg-white dark:bg-[#1c2620] h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal transition-all"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" type="button">
              <span className="material-symbols-outlined">visibility</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-none">Confirm Password</label>
          <div className="relative">
            <input
              className="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary border border-slate-200 dark:border-background-dark/20 bg-white dark:bg-[#1c2620] h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal transition-all"
              placeholder="••••••••"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mt-6">
          <button className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-background-dark font-bold py-4 rounded-full text-lg transition-colors shadow-lg shadow-primary/20 flex items-center justify-center" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          
          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span className="text-slate-400 text-sm font-medium">OR</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 rounded-lg py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" type="button">
              <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNlU-muScyOxwMYhY93yl5mZBv4CXJauXr8DpNlqythwDmrYD6IXXVtFqB00NEYA1iWipW08-0vVNla8tes8fUjYzkM5UU0USqwxiWu5SHbCfZpI6OIghcIKnJtXRHA-eZyk31FYXN4UJusXuhYhUpn5LBEqAvErXsJ1ZaSSuh776_Z6G-R7doWhD8PM1fGjgV1C3gqIeEW_-TyisIRqbGfs3b6Urh6z5oStJS8Hqmg7pgjNgMYvwcV5RUD6tO3TK_hyezIeOldBM" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 rounded-lg py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" type="button">
              <span className="material-symbols-outlined text-blue-600">social_leaderboard</span>
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>
          
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-4">
            Already have an account? 
            <Link to="/" className="text-primary font-bold hover:underline ml-1">Back to login</Link>
          </p>
        </div>
      </form>
      
      <div className="mt-auto px-6 py-8 text-center">
        <p className="text-[10px] text-slate-500 dark:text-slate-600 leading-relaxed max-w-[320px] mx-auto">
          By clicking "Register", you agree to our Terms of Service and Privacy Policy. You may receive SMS notifications from us and can opt out at any time.
        </p>
      </div>
    </div>
  );
}
