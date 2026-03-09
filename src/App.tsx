import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LobbyPage from '@/pages/LobbyPage';
import ChatRoomPage from '@/pages/ChatRoomPage';
import { ensureAuth } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<LobbyPage />} />
      <Route path="/room/:code" element={<ChatRoomPage />} />
      {/* Fallback — send unknown routes to lobby */}
      <Route path="*" element={<LobbyPage />} />
    </Routes>
  );
}

export default function App() {
  const setUid = useUserStore((s) => s.setUid);

  // Sign in anonymously as soon as the app loads
  useEffect(() => {
    ensureAuth()
      .then((user) => setUid(user.uid))
      .catch((error) => {
        console.error('Failed to sign in anonymously', error);
      });
  }, [setUid]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
