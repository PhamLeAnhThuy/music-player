import { Link } from 'react-router-dom';

export default function Library() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold text-sm">JS</div>
          <h1 className="text-xl font-bold tracking-tight">Your Library</h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">search</span>
          </button>
          <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">add</span>
          </button>
        </div>
      </header>

      <nav className="sticky top-[68px] z-10 bg-background-light dark:bg-background-dark px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button className="whitespace-nowrap px-4 py-2 rounded-full bg-primary text-background-dark font-bold text-sm">Playlists</button>
          <button className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-200 dark:bg-primary/10 text-slate-900 dark:text-slate-100 font-bold text-sm">Liked Songs</button>
          <button className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-200 dark:bg-primary/10 text-slate-900 dark:text-slate-100 font-bold text-sm">History</button>
          <button className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-200 dark:bg-primary/10 text-slate-900 dark:text-slate-100 font-bold text-sm">Artists</button>
          <button className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-200 dark:bg-primary/10 text-slate-900 dark:text-slate-100 font-bold text-sm">Albums</button>
        </div>
      </nav>

      <main className="flex-1 px-4 py-4 space-y-6 pb-40 overflow-y-auto hide-scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-lg">swap_vert</span>
            <span className="text-sm font-medium">Recents</span>
          </div>
          <button className="p-1">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">grid_view</span>
          </button>
        </div>

        <button className="w-full flex items-center gap-4 group">
          <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-primary/10 flex items-center justify-center transition-all group-active:scale-95">
            <span className="material-symbols-outlined text-3xl text-primary">add</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-base">Create playlist</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Build your perfect mix</p>
          </div>
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white material-symbols-fill text-2xl">favorite</span>
            </div>
            <div>
              <p className="font-bold text-base">Liked Songs</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-primary material-symbols-fill">keep</span>
                Playlist • 1,248 songs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#006450] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[#1db954] material-symbols-fill text-2xl">mic</span>
            </div>
            <div>
              <p className="font-bold text-base">Your Episodes</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Saved & downloaded</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-cover bg-center shadow-md" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnx90xE49RmH0DiCJSn-_NwMmalf-Rj5MNWxzvQMkFKa2fqYI7HA-_wOsyd2hY1NhyhPlnL_I2YQj9l06xHHIK7xo1dHmTMg0cKKr5VpBu1o6hKHYBUJxChzALuCLG3CQTQCff7loojifrLjm2AojtuTYjcL6-p5Ky3A8oZcznZCbtEDpR9HaOul495PyNj5XLnCPNWWeII54Q4HBSkNNGoVWckAiKEpdHkbBl6w20eY4h2DHfb1aVpp_PqhQGgcdaHKj-TYYwRSo')" }}></div>
            <div>
              <p className="font-bold text-base">Techno Bunker</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Playlist • By you</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-cover bg-center shadow-md" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBBGDQx3rejVF8jK1020LVgm5adRoGkqT5TM1gJ0OV2g9Kz34hdPJmGYOmuYEx54JoAkAcs9hioqpB1ltXpdHHM0uWQTJWw_e-FeB81S-6TZ-hhGFLgTSMx_mFHe5pjDSB1wMHNd2sJDtT2hPdyChNOU8b6rU6hzvVoftNRYubFvRCt2zGvetcRyVF520fLtKp4eCNPaAEoYuXGEst5_He8ykF0bdsiUFWP-dmpggznxV_jwWMCRkVrxxeh9nDCAU9BzjX4riocMUA')" }}></div>
            <div>
              <p className="font-bold text-base">Morning Coffee</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Playlist • Spotify</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-cover bg-center shadow-md" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGIYc4TXb7mip8b7JSSXj4AQr4rie0vHRd6XiJwifsX-KwzqT1SPPUznhZx0jw-2ZATYAgnc7-Uw0g55M6Ya52i6cvEFg8cc_pGMegD6ekj_jcUvkUUX3Qxh0MdXZ0xbEeakzk0LcMFe8IUqzraXJ9XU1MdSZBQLZH2t3yUPgyf1IMLTut0XaEvq9YQHkkfd0dzpwj60CpQAfz6QzsxYUpL9KQHZK1OlLN1q43QyUS7YsrfLEhU3PP2Tf0C6EagXr9BwEKig6oT-g')" }}></div>
            <div>
              <p className="font-bold text-base">Late Night Drives</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Playlist • 42 songs</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-cover bg-center shadow-md" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBM_XVcrrwhalP2UTVPMp6tuK9D6TX4kRupllx2d9pZ88oWzeioe-YqZ5E68CqHzn92vq07iskwSFxo81BUs45Xx_dEQM_EJwpSb9GYIzvz-d8PlPsZO5yoQsZfbDHa2gXbup6f1Ck0vhX6P1rLWqAH7ch0dNbjOpUvFHUtt831xO0shP4b22QUOXqSF6ToTckuTICkn3XPU-KwzF3XAq-mObmDl7i4cBBhtfbL8fqbOrcqhJN6V04siVl3bRIp6pO28IdeJqEtEo')" }}></div>
            <div>
              <p className="font-bold text-base">Summer Hits 2024</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Playlist • By Sarah</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
