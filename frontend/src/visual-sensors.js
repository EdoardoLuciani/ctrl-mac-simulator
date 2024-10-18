import Konva from "konva";

export class VisualSensors {
  constructor(x, y, sensorCount, sensorRadius) {
    this.sensors = new Konva.Group();

    let newX = x;
    let newY = y;

    for (let i = 0; i < sensorCount; i++) {
      const group = new Konva.Group({
        x: newX,
        y: newY,
      });

      group.add(
        new Konva.Circle({
          radius: sensorRadius,
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
