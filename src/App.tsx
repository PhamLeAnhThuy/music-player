import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import SignIn from './screens/SignIn';
import CreateAccount from './screens/CreateAccount';
import ForgotPassword from './screens/ForgotPassword';
import Home from './screens/Home';
import Search from './screens/Search';
import Library from './screens/Library';
import Profile from './screens/Profile';
import EditProfile from './screens/EditProfile';
import Playlist from './screens/Playlist';
import NowPlaying from './screens/NowPlaying';
import Queue from './screens/Queue';
import SongList from './screens/SongList';
import { getStoredUserId } from './lib/api';

function RequireAuth() {
  const userId = getStoredUserId();
  return userId ? <Outlet /> : <Navigate to="/" replace />;
}

function RedirectIfAuthenticated() {
  const userId = getStoredUserId();
  return userId ? <Navigate to="/home" replace /> : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route element={<RedirectIfAuthenticated />}>
          <Route index element={<SignIn />} />
          <Route path="create-account" element={<CreateAccount />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="home" element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="playlist" element={<Playlist />} />
          <Route path="song-list" element={<SongList />} />
          <Route path="now-playing" element={<NowPlaying />} />
          <Route path="queue" element={<Queue />} />
        </Route>
      </Route>
    </Routes>
  );
}
