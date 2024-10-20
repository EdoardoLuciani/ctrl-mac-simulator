import Plotly from "plotly.js-finance-dist-min";

export class Plotter {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  plot(ftrValues, measurementLatencies) {
    const trace1 = {
      x: Array.from(Array(ftrValues.length).keys()),
      y: ftrValues,
      mode: "lines+markers",
      name: "FTR Time Series",
      type: "scatter",
    };

    // const trace2 = {
    //   x: measurementLatencies,
    //   type: "histogram",
    //   nbinsx: 20,
    //   name: "Measurement Latency",
    // };
    var trace2 = {
      x: measurementLatencies,
      xaxis: "x2",
      yaxis: "y2",
      type: "histogram",
      name: "Measurement Latency",
    };

    const layout = {
      grid: { rows: 2, columns: 1, pattern: "independent" },
      height: 2000,
      title: "FTR and Measurement Latency Analysis",
      template: "plotly_white",
      // annotations: [
      //   {
      //     text: "Discrete Values Time Series",
      //     xref: "paper",
      //     yref: "paper",
      //     x: 0.5,
      //     y: 1.0,
      //     xanchor: "center",
      //     yanchor: "bottom",
      //     showarrow: false,
      //   },
      //   {
      //     text: "Distribution of Measurement Latency",
      //     xref: "paper",
      //     yref: "paper",
      //     x: 0.5,
      //     y: 0.45,
      //     xanchor: "center",
      //     yanchor: "bottom",
      //     showarrow: false,
      //   },
      // ],
    };

    const config = { responsive: true };

    Plotly.react(this.container, [trace1, trace2], layout);

    // Update axis labels
    // Plotly.update(
    //   this.container,
    //   {},
    //   {
    //     "xaxis.title": "Array Position",
    //     "yaxis.title": "Value",
    //     "xaxis2.title": "Latency",
    //     "yaxis2.title": "Frequency",
    //   },
    // );
  }
}
