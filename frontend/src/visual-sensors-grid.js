import Konva from "konva";
import { buildSensor } from "./visual-sensor-helper";
import { GridAllocator } from "./grid-allocator";

export class VisualSensorsGrid {
  constructor(x, y, maxWidth, sensorCount, sensorRadius) {
    const fontSize = 18;

    // Create the texts
    this.textGroup = new Konva.Group({ x: x, y: y });

    this.textGroup.add(
      ...["Idle", "Backoff 0", "Backoff 1", "Backoff +"].map(
        (str, idx, initialArray) => {
          return new Konva.Text({
            x: (maxWidth / initialArray.length) * idx,
            text: str,
            fontSize: fontSize,
            fontFamily: "Arial",
          });
        },
      ),
    );

    // Create the grid allocators
    this.gridAllocators = this.textGroup
      .getChildren()
      .map((text, _, initialArray) => {
        return new GridAllocator(
          this.textGroup.x() + text.x() + sensorRadius,
          this.textGroup.y() + 50,
          sensorRadius * 2.5,
          Math.floor(maxWidth / initialArray.length / (sensorRadius * 2.8)),
          sensorCount,
        );
      });

    // Create the sensors
    this.sensors = new Konva.Group();

    let newX = x + sensorRadius;
    let newY = y + fontSize * 2;

    for (let i = 0; i < sensorCount; i++) {
      const sensor = buildSensor(0, 0, sensorRadius, i);
      const pos = this.gridAllocators[0].allocate(sensor);

      sensor.x(pos.x);
      sensor.y(pos.y);

      this.sensors.add(sensor);
    }
  }

  get shape() {
    return [this.sensors, this.textGroup];
  }

  animateSensorToSection(sensorIndex, sectionIndex) {
    const sensor = this.sensors.children[sensorIndex];

    this.gridAllocators.forEach((allocator) => allocator.free(sensor));
    const pos = this.gridAllocators[sectionIndex].allocate(sensor);

    return {
      tweenConstructor: {
        node: sensor,
        duration: 1,
        x: pos.x,
        y: pos.y,
      },
    };
  }

  animateSensorToPos(sensorIndex, destX, destY) {
    const sensor = this.sensors.children[sensorIndex];

    return {
      tweenConstructor: {
        node: sensor,
        duration: 1,
        x: destX,
        y: destY,
      },
    };
  }
}
