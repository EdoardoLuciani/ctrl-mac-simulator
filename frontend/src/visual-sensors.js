export class VisualSensors {
  constructor(sensorCount, radius, x, y) {
    this.sensors = [];

    const angle = (Math.PI * 2) / sensorCount;
    for (let i = 0; i < sensorCount; i++) {
      this.sensors.push(
        new Konva.Circle({
          x: x + radius * Math.cos(i * angle),
          y: y + radius * Math.sin(i * angle),
          radius: 30,
          stroke: "red",
        }),
      );
    }
  }

  get shape() {
    return this.sensors;
  }
}
