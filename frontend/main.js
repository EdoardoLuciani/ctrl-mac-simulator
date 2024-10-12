import "./style.css";
import {
  clearCanvas,
  setupCanvas,
  resizeCanvas,
} from "./src/visual-simulation";

window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

document
  .getElementById("simulationForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const params = new URLSearchParams();
    for (let [key, value] of formData.entries()) {
      if (value !== "") {
        params.append(key, value);
      }
    }

    fetch(`/api/simulate?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("result").textContent = data.logs.join("\n");

        setupCanvas();
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("result").textContent =
          "An error occurred while running the simulation.";
      });
  });

// Add event listener for the reset button
document.getElementById("resetButton").addEventListener("click", function () {
  // Clear the result area
  clearCanvas();
  document.getElementById("result").textContent = "";
});
