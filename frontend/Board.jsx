import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function Board({ user, roomId, onLeave }) {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:8080", {
      auth: { token: user.token }
    });
    
    setSocket(newSocket);
    newSocket.emit("joinBoard", roomId);
    
    return () => newSocket.disconnect();
  }, [user.token, roomId]);

  useEffect(() => {
    if (!socket || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let mouseDown = false;

    socket.on("hydrate", (events) => {
      setIsJoined(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      events.forEach(({ x, y, type }) => {
        if (type === "begin") {
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else if (type === "draw") {
          ctx.lineTo(x, y);
          ctx.stroke();
        } else if (type === "end") {
          ctx.beginPath();
        }
      });
      ctx.beginPath();
    });

    socket.on("onDraw", ({ x, y, type }) => {
      if (type === "begin") {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (type === "draw") {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (type === "end") {
        ctx.beginPath();
      }
    });

    socket.on("onClear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    const getCoordinates = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const handleMouseDown = (e) => {
      if (!isJoined) return;
      mouseDown = true;
      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      socket.emit("draw", { boardId: roomId, x, y, type: "begin" });
    };

    const handleMouseUpOrLeave = () => {
      if (!mouseDown) return;
      mouseDown = false;
      ctx.beginPath();
      socket.emit("draw", { boardId: roomId, type: "end" });
    };

    const handleMouseMove = (e) => {
      if (!isJoined || !mouseDown) return;
      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      socket.emit("draw", { boardId: roomId, x, y, type: "draw" });
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUpOrLeave);
    canvas.addEventListener("mouseleave", handleMouseUpOrLeave);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUpOrLeave);
      canvas.removeEventListener("mouseleave", handleMouseUpOrLeave);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [socket, isJoined, roomId]);

  return (
    <div className="flex flex-col items-center p-8 bg-[#F5F3FF] min-h-screen">
      <div className="flex w-full max-w-4xl justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#5B4E8B]">Room: {roomId}</h2>
        <div className="flex gap-4">
          <button onClick={() => socket?.emit("clearBoard", roomId)} className="px-4 py-2 bg-white border-2 border-[#C8B6E2] text-[#8B7BA8] font-semibold rounded-lg hover:bg-[#F5F3FF] transition">
            Clear Board
          </button>
          <button onClick={onLeave} className="px-4 py-2 bg-[#C8B6E2] text-white font-semibold rounded-lg hover:bg-[#B8A6D2] transition">
            Leave Board
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} width="800" height="600" className="bg-white border-2 border-[#E5E7EB] rounded-2xl shadow-lg cursor-crosshair w-full max-w-4xl object-contain" />
    </div>
  );
}