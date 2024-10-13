import Konva from "konva";

export class VisualSensors {
  constructor(sensorCount, radius, x, y) {
    this.sensors = new Konva.Group();
    this.tweens = [];

    const angle = (Math.PI * 2) / sensorCount;
    for (let i = 0; i < sensorCount; i++) {
      const group = new Konva.Group({
        x: x + radius * Math.cos(i * angle),
        y: y + radius * Math.sin(i * angle),
      });

      group.add(
        new Konva.Circle({
          radius: 30,
          stroke: "red",
        }),
      );

      const text = new Konva.Text({
        text: `S${i}`,
        fontSize: 18,
        fontFamily: "Arial",
      });
      text.x(-text.width() / 2);
      text.y(-text.height() / 2);

      group.add(text);

      this.sensors.add(group);
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
    this.tweens.push(
      new Konva.Tween({
        node: dot,
        duration: 2,
        x: destX,
        y: destY,
        easing: Konva.Easings.StrongEaseIn,
        onFinish: () => {
          dot.destroy(); // Remove the dot after animation
          layer.batchDraw();
        },
      }),
    );

    this.resumeAnimations();
  }

  pauseAnimations() {
    this.tweens.forEach((tween) => tween.pause());
  }

  resumeAnimations() {
    this.tweens.forEach((tween) => tween.play());
  }
}
