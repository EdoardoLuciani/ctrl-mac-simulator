import Konva from "konva";
import { blake3 } from "@noble/hashes/blake3";
import { bytesToHex } from "@noble/hashes/utils";

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
          radius: 22,
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

      const subscript = new Konva.Text({
        text: null,
        fontSize: 14,
        fontFamily: "Arial",
      });
      subscript.x(-subscript.width() / 2);
      subscript.y(subscript.height() / 2.5);

      group.add(text, subscript);

      this.sensors.add(group);
    }
  }

  get shape() {
    return this.sensors;
  }

  setSensorSubscript(sensorIndex, text) {
    this.sensors.getChildren()[sensorIndex].getChildren()[2].text(text);
  }

  clearAllSensorSubscripts() {
    this.sensors.getChildren().forEach((sensor) => {
      sensor.getChildren()[2].text(null);
    });
  }

  animateTransmissionRequest(sensorIndex, destX, destY, text) {
    const sensor = this.sensors.children[sensorIndex];

    const color = "#" + bytesToHex(blake3(text.toString())).substring(0, 6);

    const dot = new Konva.Circle({
      radius: 6,
      fill: color,
      stroke: "black",
      strokeWidth: 1,
    });

    const group = this.#createInvisibleGroupWithText(
      dot,
      sensor.x(),
      sensor.y(),
      "Slot: " + text,
    );
    return this.#tweenObject(group, destX, destY);
  }

  animateDataTransmission(sensorIndex, destX, destY) {
    const sensor = this.sensors.children[sensorIndex];

    const rads = Math.atan2(destY - sensor.y(), destX - sensor.x());
    const degs = (rads * 180) / Math.PI;

    const offsetDistance = 10;
    const wedge = new Konva.Wedge({
      x: Math.cos(rads) * offsetDistance,
      y: Math.sin(rads) * offsetDistance,
      radius: 20,
      angle: 60,
      fill: "purple",
      stroke: "black",
      strokeWidth: 1,
      rotation: degs + (180 - 30),
    });

    const group = this.#createInvisibleGroupWithText(
      wedge,
      sensor.x(),
      sensor.y(),
      "Data",
    );
    return this.#tweenObject(group, destX, destY);
  }

  #createInvisibleGroupWithText(object, x, y, text) {
    const group = new Konva.Group({
      x: x,
      y: y,
      visible: false,
    });

    const textObj = new Konva.Text({
      x: 10,
      y: 10,
      text: text,
      fontSize: 18,
      fontFamily: "Arial",
    });
    group.add(object, textObj);
    return group;
  }

  #tweenObject(objectToAnimate, destX, destY) {
    const layer = this.sensors.getLayer();
    layer.add(objectToAnimate);

    const oldPos = objectToAnimate.position();

    return {
      node: objectToAnimate,
      duration: 1,
      x: destX,
      y: destY,
      onStart: () => {
        objectToAnimate.position(oldPos);
        objectToAnimate.visible(true);
      },
      onFinish: () => {
        objectToAnimate.visible(false);
      },
    };
  }
}
