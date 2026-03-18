import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import MiniPlayer from './MiniPlayer';

export default function Layout() {
  const location = useLocation();
  const hideNavScreens = ['/', '/create-account', '/forgot-password', '/now-playing', '/queue'];
  const showNav = !hideNavScreens.includes(location.pathname);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <Outlet />
      </div>
      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <MiniPlayer />
          <BottomNav />
        </div>
      )}
    </div>
  );
}
