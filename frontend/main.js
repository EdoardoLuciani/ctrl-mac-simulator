import { Scene } from "./src/js/scene";
import { Plotter } from "./src/js/plotter";

const scene = new Scene("canvas-column");
const plotter = new Plotter("plotly-graph");

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
        scene.setupScene(formData.get("sensor_count"), data.log);
        scene.playAnimations();
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
  const playPauseButton = document.getElementById("play-pause-button");
  const currentState = playPauseButton.dataset.state;

  if (currentState === "paused") {
    scene.tweenTimeTraveler.playQueue();
    playPauseButton.querySelector("i").classList.remove("fa-play");
    playPauseButton.querySelector("i").classList.add("fa-pause");
    playPauseButton.dataset.state = "playing";
  } else {
    scene.tweenTimeTraveler.pauseQueue();
    playPauseButton.querySelector("i").classList.remove("fa-pause");
    playPauseButton.querySelector("i").classList.add("fa-play");
    playPauseButton.dataset.state = "paused";
  }
});

document.getElementById("prev-button").addEventListener("click", () => {
  scene.tweenTimeTraveler.goToPreviousGroup();
});

document.getElementById("next-button").addEventListener("click", () => {
  scene.tweenTimeTraveler.goToNextGroup();
});

document.getElementById("restart-button").addEventListener("click", () => {
  scene.tweenTimeTraveler.goToGroup(0);
  scene.tweenTimeTraveler.playQueue();
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
