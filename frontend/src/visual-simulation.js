const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function setupCanvas() {
  clearCanvas();

  createCircle(0.5, 0.5, 40, "Gateway");
}

export function createCircle(x, y, radius, below_text) {
  ctx.beginPath();
  ctx.arc(
    canvas.width * x + radius,
    canvas.height * y + radius,
    radius,
    0,
    2 * Math.PI,
  );
  ctx.stroke();

  // Text under the figure
  const offset = 10;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    below_text,
    canvas.width * x + radius,
    canvas.height * y + radius * 2 + offset,
  );
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
