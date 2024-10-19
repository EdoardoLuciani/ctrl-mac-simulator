import "./style.css";
import { Scene } from "./src/scene";

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
      .then(async (response) => {
        scene.clearScene();

        if (!response.ok) {
          return response.text().then((errorMessage) => {
            throw new Error(errorMessage);
          });
        }
        return response.json();
      })
      .then((data) => {
        document.getElementById("errorBox").textContent = "";

        scene.setupScene(
          formData.get("sensor_count"),
          formData.get("request_slots"),
          data.logs.join("\n"),
        );
        scene.playAnimations();
      })
      .catch((error) => {
        console.error(error);

        document.getElementById("errorBox").textContent =
          `An error occurred: ${error.message}`;
      });
  });

document.getElementById("resetButton").addEventListener("click", () => {
  scene.clearScene();
  document.getElementById("result").textContent = "";
});

document.getElementById("resumeButton").addEventListener("click", () => {
  scene.tweenPacer.resumeQueue();
});

document.getElementById("pauseButton").addEventListener("click", () => {
  scene.tweenPacer.pauseQueue();
});

document.getElementById("prevButton").addEventListener("click", () => {
  scene.tweenPacer.rollbackToPreviousGroup();
});

document.getElementById("nextButton").addEventListener("click", () => {
  scene.tweenPacer.fastForwardToNextGroup();
});
