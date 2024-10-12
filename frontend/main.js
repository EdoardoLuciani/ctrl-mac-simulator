import "./style.css";

document
  .getElementById("simulationForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = new URLSearchParams(formData);

    fetch(`/simulate?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("result").textContent = data.logs.join("\n");
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("result").textContent =
          "An error occurred while running the simulation.";
      });
  });
