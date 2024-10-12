const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function setupCanvas() {
  clearCanvas();

  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, 2 * Math.PI);
  ctx.stroke();
}

export function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function resizeCanvas() {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}
