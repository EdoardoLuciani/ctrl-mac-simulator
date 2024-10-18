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

    this.sensorRadius = 20;

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
      sensorCount,
      this.sensorRadius,
    );

    this.layer.add(this.visualSensors.shape, this.visualGateway.shape);
  }

  playAnimations() {
    let requestSlotsPos = this.visualGateway.getNextRequestSlotsPos();

    const sensorsWithRequestSlot = [
      { id: 0, requestSlot: 0 },
      { id: 1, requestSlot: 0 },
      { id: 2, requestSlot: 1 },
    ];

    const tweenGroup = sensorsWithRequestSlot.map((elem) => {
      const anim = this.visualSensors.animateSensorToPos(
        elem.id,
        requestSlotsPos[elem.requestSlot].x,
        requestSlotsPos[elem.requestSlot].y,
      );
      requestSlotsPos[elem.requestSlot].y += this.sensorRadius * 2.25;
      return anim;
    });
    this.tweenPacer.queueTweenGroup(...tweenGroup);

    requestSlotsPos = this.visualGateway.getNextRequestSlotsPos();

    this.tweenPacer.queueTweenGroup(
      this.visualSensors.animateSensorToPos(
        3,
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
