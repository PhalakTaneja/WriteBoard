import './style.css';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const joinBtn = document.getElementById("joinBtn");
const usernameInput = document.getElementById("username");

const BOARD_ID = "board-1";
let joined = false;
let mouseDown = false;
const clearBtn = document.getElementById("clearBtn");


const socket = io("http://localhost:8080");

clearBtn.addEventListener("click", () => {
  if (!joined) return;
  socket.emit("clearBoard");
});

joinBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) return;

  socket.emit("joinBoard", {
    boardId: BOARD_ID,
    username,
  });
});

socket.on("hydrate", (events) => {
  joined = true;
  canvas.hidden = false;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  events.forEach(({x,y,type}) => {
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

canvas.addEventListener("mousedown", (e) => {
  if (!joined) return;
  mouseDown = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);

   socket.emit("draw", {
    x: e.offsetX,
    y: e.offsetY,
    type: "begin",
  });
});

function endStroke() {
  if (!mouseDown) return;
  mouseDown = false;
  ctx.beginPath();
  socket.emit("draw", {type: "end"});
}
canvas.addEventListener("mouseup", endStroke);

canvas.addEventListener("mouseleave",endStroke);

canvas.addEventListener("mousemove", (e) => {
  if (!joined || !mouseDown) return;

  const x = e.offsetX;
  const y = e.offsetY;

  ctx.lineTo(x, y);
  ctx.stroke();

  socket.emit("draw", { x, y, type: "draw" });
});

socket.on("onClear", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});