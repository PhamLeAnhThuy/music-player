import { Link } from 'react-router-dom';

export default function MiniPlayer() {
  return (
    <div className="mx-4 mb-2">
      <Link to="/now-playing" className="relative bg-slate-900/90 dark:bg-primary/10 backdrop-blur-md border border-slate-800 dark:border-primary/20 rounded-xl p-2 flex items-center justify-between shadow-2xl block">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg overflow-hidden shrink-0">
            <img
              alt="Mini Player Cover"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKjZQKOarsbeP70hKuH1ZTjf6W6RmomKpkcap4DkHA0W9zJ8wrVTssyKkgATdMZTYXUP0RJwzfiEmDxbw9UWWpTMfncWnPvvoJ0xLiH82ceg33F0YUhaggcurNx9RHJpQer07iM8cZL6kHalO-BTxqSq0PF7RBslDN297rCmdh3p0p46Xo6cryYlSeXyffihw1A38gpqx_AqtkMsZVY21NiWtGunG-9VHpTYodm-0_Jiyhf1-Bj_5Qivt8zcNlUPN5NMfacYtCw7g"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate text-slate-100 dark:text-slate-100">Midnight City</p>
            <p className="text-xs text-slate-400 dark:text-primary/60 truncate">M83 • Hurry Up, We're Dreaming</p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-2">
          <button className="text-slate-100" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined text-2xl">devices</span>
          </button>
          <button className="size-10 flex items-center justify-center rounded-full bg-primary text-background-dark" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined text-3xl fill-1">pause</span>
          </button>
        </div>
        <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-slate-700/30 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-2/3"></div>
        </div>
      </Link>
    </div>
  );
}
