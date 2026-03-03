import { useState, useEffect } from 'react';

export default function Dashboard({ user, onJoinBoard, onLogout }) {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/board/my-boards', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.status === 401) {
        onLogout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      }
    } catch (err) {
      setErrorMsg('Failed to fetch boards');
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      const response = await fetch('/api/board/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ name: newBoardName })
      });
      if (response.ok) {
        setNewBoardName('');
        fetchBoards();
      } else {
        const data = await response.json();
        setErrorMsg(data.message || 'Failed to create board');
      }
    } catch (err) {
      setErrorMsg('Server error');
    }
  };

  const handleDeleteBoard = async (roomId) => {
    try {
      const response = await fetch(`/api/board/delete/${roomId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        fetchBoards();
      }
    } catch (err) {
      setErrorMsg('Failed to delete board');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] p-8 font-['Poppins']">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12 bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
          <div>
            <h1 className="text-3xl font-bold text-[#5B4E8B]">My Boards</h1>
            <p className="text-[#6B7280]">Welcome back, {user.username}</p>
          </div>
          <button onClick={onLogout} className="px-6 py-2 bg-white border-2 border-[#C8B6E2] text-[#8B7BA8] font-semibold rounded-xl hover:bg-[#F5F3FF] transition-all">
            Logout
          </button>
        </div>
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl text-center">
            {errorMsg}
          </div>
        )}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB] mb-8">
          <form onSubmit={handleCreateBoard} className="flex gap-4">
            <input type="text" value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} placeholder="Name your new board..." className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8B6E2]" />
            <button type="submit" className="px-8 py-3 bg-[#C8B6E2] text-white font-semibold rounded-xl hover:bg-[#B8A6D2] transition-all shadow-sm">
              Create Board
            </button>
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div key={board._id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-xl font-semibold text-[#5B4E8B] mb-2">{board.name}</h3>
                <p className="text-sm text-[#9CA3AF]">ID: {board.roomId}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onJoinBoard(board.roomId)} className="flex-1 py-2 bg-[#C8B6E2] text-white font-semibold rounded-lg hover:bg-[#B8A6D2] transition-colors">
                  Join
                </button>
                <button onClick={() => handleDeleteBoard(board.roomId)} className="px-4 py-2 bg-red-50 text-red-500 font-semibold rounded-lg hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {boards.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#9CA3AF]">
              You haven't created any boards yet. Create one above to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}