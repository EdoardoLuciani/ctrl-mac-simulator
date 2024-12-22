import { describe, expect, test, beforeEach, vi } from "vitest";
import Plotly from "plotly.js-finance-dist-min";
import { Plotter } from "../src/js/plotter";
import { JSDOM } from "jsdom";

vi.mock("plotly.js-finance-dist-min", () => {
  return {
    default: {
      react: vi.fn(),
      purge: vi.fn(),
    },
  };
});

describe("Data Visualization", () => {
  // Mock DOM elements needed by Plotter
  beforeEach(() => {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="data-display"></div>
          <div id="plotly-graph"></div>
          <table id="summary-statistics-table">
            <tr><td></td><td></td></tr>
            <tr><td></td><td></td></tr>
            <tr><td></td><td></td></tr>
            <tr><td></td><td></td></tr>
            <tr><td></td><td></td></tr>
            <tr><td></td><td></td></tr>
            <tr><td></td><td></td></tr>
          </table>
        </body>
      </html>
    `);

    global.window = dom.window;
    global.document = dom.window.document;
  });

  test("plotly graphs should render with correct data", () => {
    let plotter = new Plotter();

    const ftrValues = [0.1, 0.2, 0.3];
    const measurementLatencies = [0.5, 0.6, 0.7];
    const statistics = {
      median_ftr: 0.2,
      cycles_to_ftr_equilibrium: 3,
      measurement_latency_1_percentile: 0.5,
      measurement_latency_25_percentile: 0.55,
      measurement_latency_50_percentile: 0.6,
      measurement_latency_75_percentile: 0.65,
      measurement_latency_99_percentile: 0.7,
    };

    plotter.plot(ftrValues, measurementLatencies, statistics);

    expect(Plotly.react).toBeCalledTimes(1);

    // Check if Plotly.react was called with correct data
    const [element, data, layout, config] = vi.mocked(Plotly.react).mock
      .lastCall;

    // Verify the element is correct
    expect(element).toBe(document.getElementById("plotly-graph"));

    // Verify FTR values trace
    expect(data[0].y).toEqual(ftrValues);
    expect(data[0].type).toBe("scatter");
    expect(data[0].mode).toBe("lines");
    expect(data[0].name).toBe("FTR Values");

    // Verify measurement latencies trace
    expect(data[1].x).toEqual(measurementLatencies);
    expect(data[1].type).toBe("histogram");
    expect(data[1].name).toBe("Measurement Latencies");

    // Verify layout configuration
    expect(layout.grid).toEqual({
      rows: 1,
      columns: 2,
      pattern: "independent",
    });
    expect(layout.height).toBe(800);
  });

  test("summary statistics should update correctly", () => {
    let plotter = new Plotter();

    const statistics = {
      median_ftr: 0.2,
      cycles_to_ftr_equilibrium: 3,
      measurement_latency_1_percentile: 0.5,
      measurement_latency_25_percentile: 0.55,
      measurement_latency_50_percentile: 0.6,
      measurement_latency_75_percentile: 0.65,
      measurement_latency_99_percentile: 0.7,
    };

    plotter.plot([], [], statistics);

    // Check if statistics are correctly displayed in the table
    const cells = document.querySelectorAll(
      "#summary-statistics-table td:nth-child(2)",
    );

    expect(cells[0].textContent).toBe(statistics.median_ftr.toString());
    expect(cells[1].textContent).toBe(
      statistics.cycles_to_ftr_equilibrium.toString(),
    );
    expect(cells[2].textContent).toBe(
      statistics.measurement_latency_1_percentile.toString(),
    );
    expect(cells[3].textContent).toBe(
      statistics.measurement_latency_25_percentile.toString(),
    );
    expect(cells[4].textContent).toBe(
      statistics.measurement_latency_50_percentile.toString(),
    );
    expect(cells[5].textContent).toBe(
      statistics.measurement_latency_75_percentile.toString(),
    );
    expect(cells[6].textContent).toBe(
      statistics.measurement_latency_99_percentile.toString(),
    );

    // Check if data display div is visible
    expect(document.getElementById("data-display").style.display).toBe("block");
  });
});
