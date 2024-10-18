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
    const requestSlotsPos = this.visualGateway.getNextRequestSlotsPos();

    this.tweenPacer.queueTweenGroup(
      this.visualSensors.animateSensorToPos(
        0,
        requestSlotsPos[0].x,
        requestSlotsPos[0].x,
      ),
      this.visualSensors.animateSensorToPos(
        1,
        requestSlotsPos[1].x,
        requestSlotsPos[1].y,
      ),
    );
    this.tweenPacer.queueTweenGroup(
      this.visualSensors.animateSensorToPos(
        2,
        requestSlotsPos[2].x,
        requestSlotsPos[2].y,
      ),
    );

    this.tweenPacer.playQueue();
  }

  clearScene() {
    this.tweenPacer.clearQueue();
    this.layer.destroyChildren();
  }
}
