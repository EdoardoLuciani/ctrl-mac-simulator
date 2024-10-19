import Konva from "konva";
import { VisualGateway } from "./visual-gateway";
import { VisualSensorsGrid } from "./visual-sensors-grid";
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
    this.visualSensors = new VisualSensorsGrid(
      0,
      this.layer.height() / 2,
      this.layer.width(),
      sensorCount,
      this.sensorRadius,
    );

    this.layer.add(...this.visualSensors.shape, ...this.visualGateway.shape);
  }

  playAnimations() {
    let sensorsWithRequestSlot = [
      { id: 0, requestSlot: 0 },
      { id: 1, requestSlot: 0 },
    ];
    this.tweenPacer.queueTweenGroup(
      ...this.#getTweenGroup(sensorsWithRequestSlot),
    );

    sensorsWithRequestSlot = [
      { id: 1, requestSlot: 0 },
      { id: 0, requestSlot: 0 },
    ];
    this.tweenPacer.queueTweenGroup(
      ...this.#getTweenGroup(sensorsWithRequestSlot),
    );

    sensorsWithRequestSlot = [
      { id: 0, requestSlot: 0 },
      { id: 1, requestSlot: 0 },
    ];
    this.tweenPacer.queueTweenGroup(
      ...this.#getTweenGroup(sensorsWithRequestSlot),
    );

    sensorsWithRequestSlot = [
      { id: 1, requestSlot: 0 },
      { id: 0, requestSlot: 0 },
    ];
    this.tweenPacer.queueTweenGroup(
      ...this.#getTweenGroup(sensorsWithRequestSlot),
    );

    this.tweenPacer.queueTweenGroup(
      this.visualSensors.animateSensorToSection(0, 1),
      this.visualSensors.animateSensorToSection(1, 2),
    );

    this.tweenPacer.playQueue();
  }

  #getTweenGroup(sensorsWithRequestSlot) {
    let requestSlotsPos = this.visualGateway.getNextRequestSlotsPos();

    return sensorsWithRequestSlot.map((elem) => {
      const anim = this.visualSensors.animateSensorToPos(
        elem.id,
        requestSlotsPos[elem.requestSlot].x,
        requestSlotsPos[elem.requestSlot].y,
      );
      requestSlotsPos[elem.requestSlot].y += this.sensorRadius * 2.25;
      return anim;
    });
  }

  clearScene() {
    this.tweenPacer.clearQueue();
    this.layer.destroyChildren();
  }
}
