import Plotly from "plotly.js-finance-dist-min";

export class Plotter {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  plot(ftrValues, measurementLatencies) {
    this.clear();

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
      margin: { l: 0, r: 0, t: 200, b: 0 },
      title: "FTR and Measurement Latency Analysis",
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
    Plotly.react(this.container, [trace1, trace2], layout, config);
  }

  clear() {
    Plotly.purge(this.container);
  }
}
