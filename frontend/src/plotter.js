import Plotly from "plotly.js-finance-dist-min";

export class Plotter {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  plot(ftrValues, measurementLatencies) {
    const trace1 = {
      x: Array.from(Array(ftrValues.length).keys()),
      y: ftrValues,
      type: "scatter",
      mode: "lines+markers",
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
      grid: { rows: 2, columns: 1, pattern: "independent" },
      height: 800,
      margin: { l: 0, r: 0, t: 150, b: 0 },
      title: "FTR and Measurement Latency Analysis",
      legend: {
        orientation: "h",
        x: 0.5,
        y: 1.1,
        xanchor: "center",
        yanchor: "top",
      },
      annotations: [
        {
          text: "FTR Values Time Series",
          xref: "paper",
          yref: "paper",
          x: 0.5,
          y: 1.0,
          xanchor: "center",
          yanchor: "bottom",
          showarrow: false,
        },
        {
          text: "Distribution of Measurement Latencies",
          xref: "paper",
          yref: "paper",
          x: 0.5,
          y: 0.45,
          xanchor: "center",
          yanchor: "bottom",
          showarrow: false,
        },
      ],
    };

    const config = { responsive: true };
    Plotly.react(this.container, [trace1, trace2], layout, config);
  }
}
