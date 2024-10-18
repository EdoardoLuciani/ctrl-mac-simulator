import Konva from "konva";
import { VisualGateway } from "./visual-gateway";
import { VisualSensors } from "./visual-sensors";
import { TweenPacer } from "./tween-pacer";

export class Scene {
  constructor(containerId) {
    const container = document.getElementById(containerId);

    this.stage = new Konva.Stage({
      container: containerId,
      width: container.clientWidth,
      height: container.clientWidth,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.centerX = this.layer.width() / 2;
    this.centerY = this.layer.height() / 2;

    this.sensorRadius = this.layer.width() / 2.5;

    this.tweenPacer = new TweenPacer();
  }

  setupScene(sensorCount, requestSlots) {
    this.visualGateway = new VisualGateway(
      0,
      0,
      this.layer.width(),
      requestSlots,
    );
    this.visualSensors = new VisualSensors(
      this.centerX,
      this.centerY,
      this.layer.width() / 2,
      sensorCount,
      this.sensorRadius,
    );

    this.layer.add(this.visualSensors.shape, this.visualGateway.shape);
  }

  playAnimations() {
    // this.tweenPacer.queueTweenGroup(
    //   this.visualSensors.animateTransmissionRequest(
    //     0,
    //     this.centerX,
    //     this.centerY,
    //   ),
    //   this.visualSensors.animateTransmissionRequest(
    //     1,
    //     this.centerX,
    //     this.centerY,
    //   ),
    // );
    // this.tweenPacer.queueTweenGroup(
    //   this.visualSensors.animateTransmissionRequest(
    //     2,
    //     this.centerX,
    //     this.centerY,
    //   ),
    // );
    // this.tweenPacer.queueTweenGroup(
    //   this.visualSensors.animateDataTransmission(1, this.centerX, this.centerY),
    // );
    // this.tweenPacer.queueTweenGroup(
    //   this.visualGateway.animateRequestReplyMessage(this.sensorRadius),
    // );
    // this.tweenPacer.playQueue();
    //
  }

  clearScene() {
    this.tweenPacer.clearQueue();
    this.layer.destroyChildren();
  }
}
