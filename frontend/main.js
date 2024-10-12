import "./style.css";
import { clearCanvas, setupCanvas } from "./src/visual-simulation";

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

        clearCanvas();
        setupCanvas(formData.get("sensor_count"));
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
