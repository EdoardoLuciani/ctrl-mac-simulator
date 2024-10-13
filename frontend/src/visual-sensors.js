import Konva from "konva";

export class VisualSensors {
  constructor(sensorCount, radius, x, y) {
    this.sensors = new Konva.Group();

    const angle = (Math.PI * 2) / sensorCount;
    for (let i = 0; i < sensorCount; i++) {
      this.sensors.add(
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

  animateDataTransmissionRequest(sensorIndex, destX, destY) {
    const sensor = this.sensors.children[sensorIndex];
    const layer = this.sensors.getLayer();

    const dot = new Konva.Circle({
      x: sensor.x(),
      y: sensor.y(),
      radius: 6,
      fill: "black",
    });

    layer.add(dot);

    // Animate the dot
    const tween = new Konva.Tween({
      node: dot,
      duration: 2,
      x: destX,
      y: destY,
      easing: Konva.Easings.StrongEaseIn,
      onFinish: () => {
        dot.destroy(); // Remove the dot after animation
        layer.batchDraw();
      },
    });

    tween.play();
  }
}
