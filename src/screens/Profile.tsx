import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiListeningStats, ApiProfile, clearStoredUserId, getUserListeningStats, getUserProfile } from '../lib/api';
import { getStoredThemeMode, setThemeMode, ThemeMode } from '../lib/theme';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [listeningStats, setListeningStats] = useState<ApiListeningStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getStoredThemeMode());

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError('');
        const profileResponse = await getUserProfile();
        setProfile(profileResponse.profile);

        try {
          const statsResponse = await getUserListeningStats();
          setListeningStats(statsResponse.stats);
        } catch {
          setListeningStats(null);
        }
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

  function onChangeThemeMode(mode: ThemeMode) {
    setThemeMode(mode);
    setThemeModeState(mode);
  }

  function formatListeningTime(totalSeconds: number) {
    const safeSeconds = Math.max(0, totalSeconds || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
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
          <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/40">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Theme</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                className={`h-9 rounded-md text-xs font-bold ${themeMode === 'system' ? 'bg-primary text-background-dark' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                onClick={() => onChangeThemeMode('system')}
              >
                System
              </button>
              <button
                className={`h-9 rounded-md text-xs font-bold ${themeMode === 'light' ? 'bg-primary text-background-dark' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                onClick={() => onChangeThemeMode('light')}
              >
                Light
              </button>
              <button
                className={`h-9 rounded-md text-xs font-bold ${themeMode === 'dark' ? 'bg-primary text-background-dark' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                onClick={() => onChangeThemeMode('dark')}
              >
                Dark
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/40">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Last 7 Days</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Listening Time</p>
                <p className="mt-1 truncate text-lg font-bold">{formatListeningTime(listeningStats?.totalListeningSeconds || 0)}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Top Genres</p>
                {listeningStats?.topGenres?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {listeningStats.topGenres.map((genre) => (
                      <span key={genre} className="rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                        {genre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 truncate text-sm font-bold">Not enough data yet</p>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Weekly listening activity updates from your recent playback history.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
