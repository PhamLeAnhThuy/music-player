import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bg-background-light dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-primary/10 px-6 py-3 flex justify-between items-center">
      <Link to="/home" className={`flex flex-col items-center gap-1 ${path === '/home' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'} transition-colors`}>
        <span className={`material-symbols-outlined ${path === '/home' ? 'fill-1' : ''}`}>home</span>
        <span className="text-[10px] font-bold">Home</span>
      </Link>
      <Link to="/search" className={`flex flex-col items-center gap-1 ${path === '/search' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'} transition-colors`}>
        <span className={`material-symbols-outlined ${path === '/search' ? 'fill-1' : ''}`}>search</span>
        <span className="text-[10px] font-bold">Search</span>
      </Link>
      <Link to="/library" className={`flex flex-col items-center gap-1 ${path === '/library' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'} transition-colors`}>
        <span className={`material-symbols-outlined ${path === '/library' ? 'fill-1' : ''}`}>library_music</span>
        <span className="text-[10px] font-bold">Library</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center gap-1 ${path === '/profile' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'} transition-colors`}>
        <span className={`material-symbols-outlined ${path === '/profile' ? 'fill-1' : ''}`}>person</span>
        <span className="text-[10px] font-bold">Profile</span>
      </Link>
    </nav>
  );
}
