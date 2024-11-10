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

  animateTransmissionRequest(sensorIndex, destX, destY, text) {
    const sensor = this.sensors.children[sensorIndex];

    const group = new Konva.Group({
      x: sensor.x(),
      y: sensor.y(),
      visible: false,
    });

    const dot = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 6,
      fill: "black",
    });

    const textObj = new Konva.Text({
      x: 10,
      y: 10,
      text: String(text),
      fontSize: 18,
      fontFamily: "Arial",
    });
    group.add(dot, textObj);

    return this.#tweenObject(group, destX, destY);
  }

  animateDataTransmission(sensorIndex, destX, destY) {
    const sensor = this.sensors.children[sensorIndex];

    const degs =
      (Math.atan2(destY - sensor.y(), destX - sensor.x()) * 180) / Math.PI;

    const wedge = new Konva.Wedge({
      x: sensor.x(),
      y: sensor.y(),
      radius: 30,
      angle: 60,
      fill: "purple",
      stroke: "black",
      rotation: degs + (180 - 30),
      visible: false,
    });

    return this.#tweenObject(wedge, destX, destY);
  }

  #tweenObject(objectToAnimate, destX, destY) {
    const layer = this.sensors.getLayer();
    layer.add(objectToAnimate);

    return new Konva.Tween({
      node: objectToAnimate,
      duration: 1,
      x: destX,
      y: destY,
    });
  }
}
