import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../lib/api';

export default function EditProfile() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const response = await getUserProfile();
        setFullName(response.profile.name || '');
        setEmail(response.profile.email || '');
        setAvatarUrl(response.profile.avatar_url || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      setIsSaving(true);
      await updateUserProfile({
        name: fullName.trim(),
        avatar_url: avatarUrl.trim() || undefined,
      });
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 justify-between border-b border-slate-200 dark:border-primary/10">
        <Link to="/profile" className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Edit Profile</h2>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto p-4 space-y-8 overflow-y-auto hide-scrollbar">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="relative group cursor-pointer">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 ring-4 ring-primary/20" style={{ backgroundImage: `url('${avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjI834rEoLtt4GUuAwiw7q2E3B89ulNqeJbtg-udNvLZuLR1j3xk9YxHq1aqRY0eDUDAJbvGW1JeuRr0DaB_pwNAumb2oTSNU3ZatzvMihqmhD67f8hy9WelY8YyGNDdDnG_OLSV-UCdEvjYCSZg7FrY5Kqn90h6ZskF1nMWo-Uro0VdulAH07MsqUKa_x5rXOmQZTpMtfBqAB1SoRpwql-tdzWjnuOsQoBYePoIyXo7NC6xFFma7p3_AAGwrmMAwlafHmjoUVFx0'}')` }}>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
            </div>
            <button className="absolute bottom-0 right-0 bg-primary text-slate-900 p-2 rounded-full shadow-lg border-2 border-background-dark">
              <span className="material-symbols-outlined text-sm block">edit</span>
            </button>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">Change Profile Photo</p>
            <p className="text-sm text-slate-500 dark:text-primary/60">JPG, GIF or PNG. Max 2MB.</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          {isLoading && <p className="text-sm text-slate-500">Loading profile...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
            <div className="relative">
              <input className="w-full h-14 px-4 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="John Doe" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-primary/40 font-medium">@</span>
              <input className="w-full h-14 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="username" type="text" value={fullName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)} readOnly />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <input className="w-full h-14 px-4 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="email@example.com" type="email" value={email} readOnly />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Avatar URL</label>
            <input className="w-full h-14 px-4 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="https://..." type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Bio</label>
            <textarea className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none" placeholder="Tell us a little bit about yourself..." value={bio} onChange={(event) => setBio(event.target.value)}></textarea>
          </div>
          <div className="flex flex-col gap-3 pt-6 pb-12">
            <button className="w-full h-14 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-60" type="submit" disabled={isSaving || isLoading}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/profile" className="w-full h-14 bg-transparent hover:bg-slate-100 dark:hover:bg-primary/5 text-slate-600 dark:text-slate-400 font-medium rounded-xl transition-all active:scale-[0.98] flex items-center justify-center">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
