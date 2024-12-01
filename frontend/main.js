import { Scene } from "./src/js/scene";
import { Plotter } from "./src/js/plotter";
import { PlayPauseController } from "./src/js/play-pause-controller";

const plotter = new Plotter("plotly-graph");
const playPauseController = new PlayPauseController("play-pause-button");
const scene = new Scene("canvas-column", playPauseController);

document
  .getElementById("simulation-form")
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
        document.getElementById("error-box").textContent = null;
        document.getElementById("seed-box").textContent =
          "Seed of the simulation is: " + data.seed;

        plotter.plot(data.ftr_values, data.measurement_latencies);

        scene.clearScene();
        scene.setupScene(Number(formData.get("sensor_count")), data.log);
      })
      .catch((error) => {
        console.error(error);
        document.getElementById("error-box").textContent =
          `An error occurred: ${error.message}`;
      });
  });

// Button event listeners
document.getElementById("reset-button").addEventListener("click", () => {
  document.getElementById("seed-box").textContent = null;
  scene.clearScene();
});

document.getElementById("play-pause-button").addEventListener("click", () => {
  if (playPauseController.toggle() === "playing") {
    scene.tweenTimeTraveler.playQueue();
  } else {
    scene.tweenTimeTraveler.pauseQueue();
  }
});

document.getElementById("prev-button").addEventListener("click", () => {
  scene.tweenTimeTraveler.goToPreviousGroup();
  playPauseController.setState("playing");
});

document.getElementById("next-button").addEventListener("click", () => {
  scene.tweenTimeTraveler.goToNextGroup();
  playPauseController.setState("playing");
});

document.getElementById("restart-button").addEventListener("click", () => {
  scene.tweenTimeTraveler.goToGroup(0);
  playPauseController.setState("playing");
});

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.target.tagName === "INPUT") return;

  switch (event.code) {
    case "Space":
      // Prevent the default spacebar action (like scrolling)
      event.preventDefault();
      document.getElementById("play-pause-button").click();
      break;
    case "ArrowLeft":
      event.preventDefault();
      document.getElementById("prev-button").click();
      break;
    case "ArrowRight":
      event.preventDefault();
      document.getElementById("next-button").click();
      break;
  }
});
