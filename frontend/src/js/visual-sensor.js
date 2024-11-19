import Konva from "konva";
import { blake3 } from "@noble/hashes/blake3";
import { bytesToHex } from "@noble/hashes/utils";

export class VisualSensor {
  constructor(x, y, sensorText) {
    this.sensor = new Konva.Group({ x: x, y: y });

    this.sensor.add(
      new Konva.Circle({
        radius: 22,
        stroke: "green",
      }),
    );

    const text = new Konva.Text({
      text: sensorText,
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

    this.sensor.add(text, subscript);
  }

  get shape() {
    return this.sensor;
  }

  setSensorSubscript(text) {
    this.sensor.getChildren()[2].text(text);
  }

  setSensorColor(color) {
    this.sensor.getChildren()[0].stroke(color);
  }

  animateTransmissionRequest(destX, destY, text) {
    const color = "#" + bytesToHex(blake3(text.toString())).substring(0, 6);

    const dot = new Konva.Circle({
      radius: 6,
      fill: color,
      stroke: "black",
      strokeWidth: 1,
    });

    const group = this.#createInvisibleGroupWithText(
      dot,
      this.sensor.x(),
      this.sensor.y(),
      "Slot: " + text,
    );
    return this.#tweenObject(group, destX, destY);
  }

  animateDataTransmission(destX, destY) {
    const rads = Math.atan2(destY - this.sensor.y(), destX - this.sensor.x());
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
      this.sensor.x(),
      this.sensor.y(),
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
    const layer = this.sensor.getLayer();
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
