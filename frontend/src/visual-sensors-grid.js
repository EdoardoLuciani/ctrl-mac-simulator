import Konva from "konva";
import { buildSensor } from "./visual-sensor-helper";

export class VisualSensorsGrid {
  constructor(x, y, sensorCount, sensorRadius) {
    this.sensors = new Konva.Group();

    let newX = x;
    let newY = y;

    for (let i = 0; i < sensorCount; i++) {
      this.sensors.add(buildSensor(newX, newY, sensorRadius, i));

      if ((i + 1) % 5 === 0) {
        newX = x;
        newY += 100;
      } else {
        newX += 50;
      }
    }
  }

  get shape() {
    return this.sensors;
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
