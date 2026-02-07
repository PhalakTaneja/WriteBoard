const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


const socket = io("http://localhost:8080");

let x = 0;
let y = 0;
let mouseDown = false;

window.onmousedown = (e) => {
  mouseDown = true;
  ctx.moveTo(x, y);
  socket.emit('mouseDown', {x, y});
};

window.onmouseup = () => {
  mouseDown = false;
};

socket.on('onDraw', ({x,y}) => {
  ctx.lineTo(x, y);
  ctx.stroke();
});

socket.on('mouseDown', ({x,y}) => {
  ctx.moveTo(x, y);
});
window.onmousemove = (e) => {
  
    x = e.clientX;
    y = e.clientY;
    if (mouseDown){
    socket.emit('draw', {x, y});
    ctx.lineTo(x, y);
    ctx.stroke();
    }
};
