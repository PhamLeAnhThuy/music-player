import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiProfile, clearStoredUserId, getUserProfile } from '../lib/api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError('');
        const response = await getUserProfile();
        setProfile(response.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  function onLogout() {
    clearStoredUserId();
    navigate('/');
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 h-16 max-w-lg mx-auto w-full">
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <span className="material-symbols-outlined block">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight">Profile</h1>
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <span className="material-symbols-outlined block">settings</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-32 overflow-y-auto hide-scrollbar">
        <section className="p-8 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 bg-slate-200 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: `url('${profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHmPwNoeg5hv8lrGGBDq1HpZHwCx9gUj-szg6w1AEkO72mvcF85lCsvi7T85e2Hg5lufLvGQCaWc3bKo4SwtxT0oE1St3DaSRmWQolP2ZXCGbnd_ul190h6dsobzBF-8Q6pysb7dbGIRujSFIKF89gqhVgQ58LHIn0ZGRJpgriOA-DvtHDCxHu6_KB7a9p6-3ExQYALpLIdJHRK3AZcLuZ0XpTUhf92kAwXCGqq60FgJEPtUXydbXsywY3updV9tFjKqkwUUbeLsM'}')` }}>
            </div>
            <button className="absolute bottom-0 right-0 bg-primary text-background-dark p-2 rounded-full border-4 border-background-light dark:border-background-dark hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-sm block">edit</span>
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{profile?.name || 'User'}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{profile?.email || 'No email'}</p>
          </div>
          {isLoading && <p className="text-sm text-slate-500">Loading profile...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex w-full gap-3">
            <Link to="/edit-profile" className="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold py-3 px-6 rounded-lg transition-colors text-sm text-center">
              Edit Profile
            </Link>
            <button className="flex-1 bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-6 rounded-lg transition-colors text-sm" onClick={onLogout}>
              Logout
            </button>
          </div>
        </section>

        <section className="px-4 space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-2">Account Settings</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className="font-medium">Personal Information</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">notifications</span>
                </div>
                <span className="font-medium">Notifications</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <span className="font-medium">Privacy & Security</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">help</span>
                </div>
                <span className="font-medium">Help Center</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
