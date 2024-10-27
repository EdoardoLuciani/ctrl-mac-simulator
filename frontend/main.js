import "./style.css";
import { Scene } from "./src/scene";
import { Plotter } from "./src/plotter";

const scene = new Scene("canvasColumn");
const plotter = new Plotter("plotly-graph");

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

        plotter.plot(data.ftr_values, data.measurement_latencies);

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

document.getElementById("playPauseButton").addEventListener("click", () => {
  const currentState = playPauseButton.dataset.state;

  if (currentState === "paused") {
    scene.tweenPacer.playQueue();
    playPauseButton.innerHTML = "&#9614;"; // pause symbol
    playPauseButton.dataset.state = "playing";
  } else {
    scene.tweenPacer.pauseQueue();
    playPauseButton.innerHTML = "&#9658;"; // play symbol
    playPauseButton.dataset.state = "paused";
  }
});

document.getElementById("prevButton").addEventListener("click", () => {
  scene.tweenPacer.gotoPreviousGroup();
});

document.getElementById("nextButton").addEventListener("click", () => {
  scene.tweenPacer.goToNextGroup();
});

document.getElementById("restartButton").addEventListener("click", () => {
  scene.tweenPacer.goToGroup(0);
  scene.tweenPacer.playQueue();
});
