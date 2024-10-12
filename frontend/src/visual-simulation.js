const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function setupCanvas(sensorCount) {
  clearCanvas();

  createCircle(0.5, 0.5, 40, "Gateway");

  const angle = (Math.PI * 2) / sensorCount;
  for (let i = 0; i < sensorCount; i++) {
    createCircle(
      0.5 + Math.cos(i * angle) * 0.3,
      0.5 + Math.sin(i * angle) * 0.3,
      30,
      `S${i}`,
    );
  }
}

export function createCircle(x, y, radius, belowText) {
  ctx.beginPath();
  ctx.arc(canvas.width * x, canvas.height * y, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Render the text inside
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(belowText, canvas.width * x, canvas.height * y);
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
