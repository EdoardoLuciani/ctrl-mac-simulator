import Konva from "konva";

export class VisualSensors {
  constructor(x, y, maxWidth, sensorCount, radius) {
    this.sensors = new Konva.Group();
    this.tweens = [];

    let newX = x;
    let newY = y;

    for (let i = 0; i < sensorCount; i++) {
      const group = new Konva.Group({
        x: newX,
        y: newY,
      });

      group.add(
        new Konva.Circle({
          radius: 20,
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

  animateTransmissionRequest(sensorIndex, destX, destY) {
    const sensor = this.sensors.children[sensorIndex];

    const dot = new Konva.Circle({
      x: sensor.x(),
      y: sensor.y(),
      radius: 6,
      fill: "black",
      visible: false,
    });

    return this.#tweenObject(dot, destX, destY);
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
