import { Link } from 'react-router-dom';

export default function NowPlaying() {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl">
      <div className="flex items-center p-6 justify-between">
        <Link to="/home" className="text-slate-900 dark:text-slate-100 p-2 hover:bg-primary/10 rounded-full transition-colors">
          <span className="material-symbols-outlined">expand_more</span>
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Playing From Playlist</span>
          <h2 className="text-slate-900 dark:text-slate-100 text-sm font-bold leading-tight">Lush Lo-fi Beats</h2>
        </div>
        <button className="text-slate-900 dark:text-slate-100 p-2 hover:bg-primary/10 rounded-full transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      <div className="flex flex-col items-stretch gap-8 px-8 pt-4 pb-8">
        <div className="flex items-center justify-center">
          <div className="bg-primary/20 bg-center bg-no-repeat aspect-square bg-cover rounded-xl w-full shadow-2xl shadow-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4XxyAaP0KMuXwS12j337zyPljYuV4IujqEEuOhIWjfe7o-bQtEFXCCoeo4BdcyJO5s1sduCH2EFMDrppvqVYn6xx9cLounWSghnW21uKuJhMitCCi8At7Jg7uHULoS62x2rCF9Mcx_CGOknrAXH-wdfb5qEQuu9ATgyOO4529nHvAp0uZXMo4y-neYuHU9Lvs9Jt0pigZNaQxCM4a6DsXFKHzfqSSEMfwgxKUSInnySNwe9734fLByAQFdnC4kqcqhLxFiNU6Vac")' }}>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight truncate">Midnight City Lights</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium truncate">The Synthwave Collective</p>
          </div>
          <div className="flex gap-2">
            <button className="text-primary p-2">
              <span className="material-symbols-outlined fill-icon">favorite</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-800">
            <div className="absolute h-full rounded-full bg-primary" style={{ width: '45%' }}></div>
            <div className="absolute top-1/2 -translate-y-1/2 size-4 rounded-full bg-slate-100 shadow-md border-2 border-primary" style={{ left: '45%' }}></div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tabular-nums">1:54</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tabular-nums">4:12</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-2">
          <button className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-2xl">shuffle</span>
          </button>
          <div className="flex items-center gap-6">
            <button className="text-slate-900 dark:text-slate-100 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-4xl fill-icon">skip_previous</span>
            </button>
            <button className="flex items-center justify-center rounded-full size-20 bg-primary text-slate-900 shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-5xl fill-icon">pause</span>
            </button>
            <button className="text-slate-900 dark:text-slate-100 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-4xl fill-icon">skip_next</span>
            </button>
          </div>
          <button className="text-primary transition-colors">
            <span className="material-symbols-outlined text-2xl">repeat</span>
          </button>
        </div>

        <div className="flex items-center justify-between px-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">playlist_add</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Add to Playlist</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">devices</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Connect</span>
          </button>
          <Link to="/queue" className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">queue_music</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Queue</span>
          </Link>
        </div>
      </div>

      <div className="mt-auto px-6 pb-8">
        <div className="bg-primary/10 dark:bg-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-primary text-xs font-bold uppercase tracking-widest">Lyrics</h3>
            <span className="material-symbols-outlined text-primary text-sm">open_in_full</span>
          </div>
          <p className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-relaxed line-clamp-2">
            Lost in the neon glow, chasing the echoes of a city that never sleeps...
          </p>
        </div>
      </div>
    </div>
  );
}
