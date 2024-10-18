import Konva from "konva";
import { buildSensor } from "./visual-sensor-helper";

export class VisualSensorsGrid {
  constructor(x, y, maxWidth, sensorCount, sensorRadius) {
    // Create the texts
    this.text = new Konva.Group({ x: x, y: y });

    this.text.add(
      ...["Idle", "Backoff 0", "Backoff 1"].map((str, idx, initialArray) => {
        return new Konva.Text({
          x: (maxWidth / initialArray.length) * idx,
          text: str,
          fontSize: 18,
          fontFamily: "Arial",
        });
      }),
    );

    // Create the sensors
    this.sensors = new Konva.Group();

    let newX = x + sensorRadius;
    let newY = y;

    for (let i = 0; i < sensorCount; i++) {
      this.sensors.add(buildSensor(newX, newY, sensorRadius, i));

      if ((i + 1) % 5 === 0) {
        newX = x + sensorRadius;
        newY += 100;
      } else {
        newX += 50;
      }
    }
  }

  get shape() {
    return [this.sensors, this.text];
  }

  animateSensorToPos(sensorIndex, destX, destY) {
    const sensor = this.sensors.children[sensorIndex];

    return new Konva.Tween({
      node: sensor,
      duration: 1,
      x: destX,
      y: destY,
    });
  }
}
