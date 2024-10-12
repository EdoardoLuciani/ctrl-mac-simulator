import "./style.css";
import { Scene } from "./src/visual-simulation";

const scene = new Scene("canvasColumn");

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

        scene.clearScene();
        scene.setupScene(formData.get("sensor_count"));
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("result").textContent =
          "An error occurred while running the simulation.";
      });
  });

document.getElementById("resetButton").addEventListener("click", function () {
  scene.clearScene();
  document.getElementById("result").textContent = "";
});
