import { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import Board from './Board';



export default function App() {
  const [user, setUser] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('writeboard_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('writeboard_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('writeboard_user');
    setUser(null);
    setActiveRoomId(null);
  };

  const handleJoinBoard = (roomId) => setActiveRoomId(roomId);
  const handleLeaveBoard = () => setActiveRoomId(null);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {!user ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : !activeRoomId ? (
        <Dashboard user={user} onJoinBoard={handleJoinBoard} onLogout={handleLogout} />
      ) : (
        <Board user={user} roomId={activeRoomId} onLeave={handleLeaveBoard} />
      )}
    </div>
  );
}