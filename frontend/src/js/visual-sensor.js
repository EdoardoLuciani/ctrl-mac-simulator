import Konva from "konva";
import { blake3 } from "@noble/hashes/blake3";
import { bytesToHex } from "@noble/hashes/utils";

export class VisualSensor {
  constructor(x, y, sensorText, gatewayXPos, gatewayYPos) {
    this.sensor = new Konva.Group({ x: x, y: y });

    this.sensor.add(
      new Konva.Circle({
        radius: 22,
        stroke: "grey",
        fill: "white",
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

    // Data transmission obj creation
    const rads = Math.atan2(
      gatewayYPos - this.sensor.y(),
      gatewayXPos - this.sensor.x(),
    );
    const degs = (rads * 180) / Math.PI;

    const offsetDistance = 10;
    this.dataTransmission = this.#createInvisibleGroupWithText(
      new Konva.Wedge({
        x: Math.cos(rads) * offsetDistance,
        y: Math.sin(rads) * offsetDistance,
        radius: 20,
        angle: 60,
        fill: "purple",
        stroke: "black",
        strokeWidth: 1,
        rotation: degs + (180 - 30),
      }),
      this.sensor.x(),
      this.sensor.y(),
      "Data",
    );

    // Transmission request obj creation
    this.transmissionRequest = this.#createInvisibleGroupWithText(
      new Konva.Circle({
        radius: 6,
        stroke: "black",
        strokeWidth: 1,
      }),
      this.sensor.x(),
      this.sensor.y(),
    );

    // Sensor wakeup text
    this.wakeupText = new Konva.Text({
      x: x + 10,
      y: y - 40,
      text: "Sensed data!",
      fontSize: 14,
      fontFamily: "Arial",
      visible: false,
    });
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
    group.add(textObj, object);
    return group;
  }

  get shape() {
    return [
      this.sensor,
      this.wakeupText,
      this.dataTransmission,
      this.transmissionRequest,
    ];
  }

  setSubscript(text) {
    this.sensor.getChildren()[2].text(text);
  }

  setStrokeColor(color) {
    this.sensor.getChildren()[0].stroke(color);
  }

  setFillColor(color) {
    this.sensor.getChildren()[0].fill(color);
  }

  animateTransmissionRequest(destX, destY, text) {
    const color = "#" + bytesToHex(blake3(text.toString())).substring(0, 6);
    const oldPos = this.transmissionRequest.position();

    return {
      node: this.transmissionRequest,
      duration: 2,
      x: destX,
      y: destY,
      onStart: () => {
        this.transmissionRequest.position(oldPos);
        this.transmissionRequest.getChildren()[0].text("Slot: " + text);
        this.transmissionRequest.getChildren()[1].fill(color);
        this.transmissionRequest.visible(true);
      },
      onFinish: () => {
        this.transmissionRequest.visible(false);
      },
    };
  }

  animateDataTransmission(destX, destY) {
    const oldPos = this.dataTransmission.position();

    return {
      node: this.dataTransmission,
      duration: 2,
      x: destX,
      y: destY,
      onStart: () => {
        this.dataTransmission.position(oldPos);
        this.dataTransmission.visible(true);
      },
      onFinish: () => {
        this.dataTransmission.visible(false);
      },
    };
  }

  animateColorChange(color) {
    return {
      node: this.sensor.getChildren()[0],
      duration: 1,
      fill: color,
      onStart: () => {
        this.wakeupText.visible(true);
      },
      onFinish: () => {
        // Bit of a hack, but this solves the bug that the color is not reset properly after the animation is finished, happens during fast forwarding
        setTimeout(() => {
          this.setFillColor("white");
        }, 1);
        this.wakeupText.visible(false);
      },
    };
  }
}
