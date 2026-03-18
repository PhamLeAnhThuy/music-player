import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiTrack, getRecommendations, getStoredUserId } from '../lib/api';

export default function Home() {
  const [recommendations, setRecommendations] = useState<ApiTrack[]>([]);
  const [recommendationError, setRecommendationError] = useState('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setRecommendationError('Sign in to load personalized recommendations.');
      return;
    }

    async function loadRecommendations() {
      try {
        setLoadingRecommendations(true);
        setRecommendationError('');
        const response = await getRecommendations(userId);
        setRecommendations(response.tracks || []);
      } catch (err) {
        setRecommendationError(err instanceof Error ? err.message : 'Could not load recommendations.');
      } finally {
        setLoadingRecommendations(false);
      }
    }

    void loadRecommendations();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBavEEsbJAZa2xZB7GrXiX7xbCpMJsjvCXNQ-XqkfmrCvUaKeB2TfeDYYH17bOgjS4Nu452oMIY3BVp4ba13AQHDzeQ8zchCDVWy-Pv_zlFH3kmqHrlXu_SBwl9JGVf9x6sI_GcW4ndOTrjXaMI9SLDxicjo3gZkeruK2DPhGrhqqNNmTNq7lV8VEs-ASUqd1gAjkr345F9Gujr1iacfjqrrtvjK51ga3XoXoN6JrsL35NW3R0qBybD6nDUw26WxjcePIGjF5U0vro" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-primary/70 font-medium">Good evening</p>
            <h1 className="text-base font-bold leading-none">Alex Rivera</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-2xl">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-40 hide-scrollbar">
        <section className="mt-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-xl font-bold tracking-tight">Recommended for You</h2>
            <a href="#" className="text-primary text-sm font-semibold">See all</a>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 hide-scrollbar">
            {loadingRecommendations && <p className="text-sm text-slate-500">Loading recommendations...</p>}
            {recommendationError && <p className="text-sm text-red-500">{recommendationError}</p>}
            {!loadingRecommendations && !recommendationError && recommendations.length === 0 && (
              <p className="text-sm text-slate-500">No recommendations available yet.</p>
            )}

            {recommendations.slice(0, 8).map((song) => (
              <Link to="/playlist" className="flex-none w-40 block" key={song.id}>
                <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden shadow-lg group">
                  <img
                    alt={song.album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    src={song.album.images[0]?.url || 'https://via.placeholder.com/320'}
                  />
                </div>
                <p className="font-bold text-sm truncate">{song.name}</p>
                <p className="text-xs text-slate-500 dark:text-primary/60 truncate">{song.artists.map((artist) => artist.name).join(', ')}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-xl font-bold tracking-tight">Trending Songs</h2>
            <a href="#" className="text-primary text-sm font-semibold">See all</a>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 hide-scrollbar">
            <div className="flex-none w-48">
              <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden relative group">
                <img alt="Trending" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6w_PyAj31JrZFNB6MES-feZarxsGm5gzUWb-epeLlezzrhgJ2h8hZ18ejSLVEj55V6R6bQ8yyVr08-QkhKWkPI_AYN2VlRcVALM_CVyh6B31rcIQNWHXa-6DVVPI5zid-uJxwiV-qpoTKB7REhAGW8bWvKeoYwOHeYgBJq24pooBZFCFpZRccCUqUHmWHD9LwiBUgEqpNNGjXomtvBvbFqqJqMp3pyvlwgziOj4URK0HJTRtPmHSt9pkQrpGSqn0TXZEdIi3vZA4" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white text-5xl fill-1">play_circle</span>
                </div>
              </div>
              <p className="font-bold text-sm truncate">After Hours</p>
              <p className="text-xs text-slate-500 dark:text-primary/60 truncate">The Weeknd</p>
            </div>
            <div className="flex-none w-48">
              <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden relative group">
                <img alt="Trending" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkJHs07KzaLcfqVfJzsFvAI2Bh4SpzziLs-GFZ7zstuhuTsUq_8siO_VxxKUvcZzNQXJ5u0EdVCSJwpqvwNSTvwL_DCLnlYya_C_JdN_J7J05MditjcJjyUwAHffnhJCM5MMuH7NzMz5_GPNr_Uuyn4BEGuliLypi7TEXeYH479F3xprIoBmv1JLX4m_gp7Lb1OeAiRT778wPs0MMDfp6yWmK-1XUlErMHkLkeegJMHIGug7e9C8eAjiRbJIr0y8Wrtq1Pn3jkBeQ" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white text-5xl fill-1">play_circle</span>
                </div>
              </div>
              <p className="font-bold text-sm truncate">Levitating</p>
              <p className="text-xs text-slate-500 dark:text-primary/60 truncate">Dua Lipa</p>
            </div>
            <div className="flex-none w-48">
              <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden relative group">
                <img alt="Trending" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdFx0vtRg2XTYoakrpNyRBCAxVbDMdaFNZ71pQH6REgzbiQ-IwB-TRt_lVzY9S1_gkEkVXJoHlyYUpyit8Ew_TyZ1GK3anmqoIzXWGOU_guRGx3T3sqkKA0wp69fD__FQJ9EA92KaG8e3dncd8Wd6vR65UI883AofIeyr-ZOtzG0PguFGgdZW3QAjJRo6w3MetB-xiBr2zIt60m6D4-jH8KKDPOZtRO03Takz_rnowcVh12IylNUYFb8Lkk0oiiQIYxbSRmo_2s8o" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white text-5xl fill-1">play_circle</span>
                </div>
              </div>
              <p className="font-bold text-sm truncate">Vintage Vibes</p>
              <p className="text-xs text-slate-500 dark:text-primary/60 truncate">The Retro Collective</p>
            </div>
          </div>
        </section>

        <section className="mt-8 mb-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-xl font-bold tracking-tight">Recently Played</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 hide-scrollbar">
            <div className="flex-none w-32">
              <div className="aspect-square rounded-full bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden border-2 border-primary/20 p-1">
                <img alt="Recent" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0G9KLCF0J_AHiFEAhQOH_5rcimS0r56wDGWcnsU7TkkS6llUr4D4-4_fQ6RrJGsRpOJPUmJKvcBLJOG1DTxYk9IfzSqKScsLVYCyUM2E1cyZzR-LgxpJH_iNN_OzYaVD43GMTg9QFHr6mWYPO1vDGpH4XVONEWpgdmmnzTRCrYXJbwcrUDEH28Y_8UvIUtpkWMp8J2R9e0KWUhKxeadFB_Y_aWIZWYQti3re5St2phyyxsmKLVWIUBwIsBEKxXj3IpoM84yhxoIc" />
              </div>
              <p className="font-bold text-xs text-center truncate">The Podcast</p>
            </div>
            <div className="flex-none w-32">
              <div className="aspect-square rounded-full bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden border-2 border-primary/20 p-1">
                <img alt="Recent" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaxcUBypE00hEo4kYXMNoBUXcsLwf0Jlys9ZTsUsnoNhKFkvbwoFmBkheX_qq0IsNiLtFSy9g4DL3uG9_bSYo4m_e9ZAInTS72R_DawaiKr4Red6aWRFVBwaNIV16SfkXE-AMQ4dVs5lR-BEaeNPpQ5F7savZRGC_SFs8TO-xb6jWCi171m9So4I8jbcZmjnbGJgHv3JbB-Pu4KWrrCNO6dsvi1xVD7NTpPCw27DSMo17aa8r14JYkP7UNlilT5Huw3902rphjD00" />
              </div>
              <p className="font-bold text-xs text-center truncate">Daily Mix 1</p>
            </div>
            <div className="flex-none w-32">
              <div className="aspect-square rounded-full bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden border-2 border-primary/20 p-1">
                <img alt="Recent" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmANLD77DxDL3Rn3OPgIyuutXUgQlBhFNRE0CeZs4f1wh-hXsn5VqHr5USGA8IzQSYqUCDVKOi6JAHk6sRZBH9tFC-a11DtQTT_6J1_r3QIDITaH7EgPI5izuwN8BO3P3x4UfEgEFBtojht3312JnxNqiVVs8OeelOLhBSxM1UItHGjplKUFmUF0JUHFwcLmkJ_c1LKot8Hp4CNsdj7xz9xVMbpQT6Okgis8P-Pg4YG0dPHtKgyqF54ODLC3trKaFROpVUWkcm2bE" />
              </div>
              <p className="font-bold text-xs text-center truncate">Acoustic Chill</p>
            </div>
            <div className="flex-none w-32">
              <div className="aspect-square rounded-full bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden border-2 border-primary/20 p-1">
                <img alt="Recent" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ8g5x1NzLHcG_wI6pH4jpe5MmmkPHaZ1Wch95oEEKS1KPy9Gfvq6BvlYJLeGLiChsz85tZFQfmRr9HTgqqN2W2BLb0vOlukuh-04nGjdNegfsQ_cnFk-igzhb5GFefUyIYTBcb18W5gA46V2ot93EhvNg_5vl37Ar3bWIn_8OxGAV6V3t2p13hqiWlQK3BP530A9OI3E9GxlArVLX6EVOsXPdRiIOMujF-hMRUjolOeXJLMhKjeuX__Bwqh3WSf24y4a1epju9qM" />
              </div>
              <p className="font-bold text-xs text-center truncate">Synthwave</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
