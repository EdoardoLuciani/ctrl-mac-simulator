import Plotly from "plotly.js-finance-dist-min";

export class Plotter {
  constructor() {
    this.dataDisplayContainer = document.getElementById("data-display");

    this.plotterContainer = document.getElementById("plotly-graph");

    this.cellContainer = document.querySelectorAll(
      `#summary-statistics-table tr td:nth-child(2)`,
    );
  }

  plot(ftrValues, measurementLatencies, statistics) {
    this.clear();
    this.dataDisplayContainer.style.display = "block";

    const trace1 = {
      x: Array.from(Array(ftrValues.length).keys()),
      y: ftrValues,
      type: "scatter",
      mode: "lines",
      name: "FTR Values",
    };

    var trace2 = {
      x: measurementLatencies,
      type: "histogram",
      xaxis: "x2",
      yaxis: "y2",
      name: "Measurement Latencies",
    };

    const layout = {
      grid: { rows: 1, columns: 2, pattern: "independent" },
      height: 800,
      margin: { l: 50, r: 50, t: 20, b: 50 },
      xaxis: {
        title: "Cycle Index",
      },
      yaxis: {
        title: "FTR Value",
      },
      xaxis2: {
        title: "Latency (s)",
      },
      yaxis2: {
        title: "Frequency",
      },
    };

    const config = { responsive: true };
    Plotly.react(this.plotterContainer, [trace1, trace2], layout, config);

    this.cellContainer[0].textContent = statistics.median_ftr;
    this.cellContainer[1].textContent = statistics.cycles_to_ftr_equilibrium;

    this.cellContainer[2].textContent =
      statistics.measurement_latency_1_percentile;
    this.cellContainer[3].textContent =
      statistics.measurement_latency_25_percentile;
    this.cellContainer[4].textContent =
      statistics.measurement_latency_50_percentile;
    this.cellContainer[5].textContent =
      statistics.measurement_latency_75_percentile;
    this.cellContainer[6].textContent =
      statistics.measurement_latency_99_percentile;
  }

  clear() {
    this.dataDisplayContainer.style.display = "none";
    Plotly.purge(this.plotterContainer);
  }
}
