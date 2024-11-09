import Konva from "konva";
import { VisualGateway } from "./visual-gateway";
import { VisualSensorsGrid } from "./visual-sensors-grid";
import { TweenTimeTraveler } from "./tween-time-traveler";
import { LogHighligther } from "./log-highlighter";

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

    this.tweenTimeTraveler = new TweenTimeTraveler();
    this.logHighlighter = new LogHighligther(this.tweenTimeTraveler);
  }

  setupScene(sensorCount, requestSlots, log) {
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

    this.logHighlighter.setLog(log);
  }

  playAnimations() {
    /////////////
    this.visualGateway.getNextRequestSlotsPos();

    /////////////
    let sensorsWithRequestSlot = [
      { id: 0, requestSlot: 4 },
      { id: 1, requestSlot: 1 },
      { id: 2, requestSlot: 2 },
      { id: 3, requestSlot: 5 },
      { id: 4, requestSlot: 3 },
      { id: 5, requestSlot: 0 },
    ];
    this.tweenTimeTraveler.queueTweenGroup(
      this.#getTweenGroup(sensorsWithRequestSlot),
      () => this.logHighlighter.highlightLogGroup(1),
    );

    /////////////
    this.tweenTimeTraveler.queueTweenGroup(
      [
        this.visualSensors.animateSensorToSection(0, 1),
        this.visualSensors.animateSensorToSection(1, 1),
        this.visualSensors.animateSensorToSection(2, 1),
        this.visualSensors.animateSensorToSection(3, 1),
        this.visualSensors.animateSensorToSection(4, 1),
        this.visualSensors.animateSensorToSection(5, 1),
      ],
      () => this.logHighlighter.highlightLogGroup(2),
    );

    /////////////
    this.visualGateway.getNextRequestSlotsPos();

    /////////////
    sensorsWithRequestSlot = [
      { id: 0, requestSlot: 5 },
      { id: 1, requestSlot: 4 },
      { id: 2, requestSlot: 4 },
      { id: 3, requestSlot: 3 },
      { id: 4, requestSlot: 5 },
      { id: 5, requestSlot: 5 },
    ];
    this.tweenTimeTraveler.queueTweenGroup(
      this.#getTweenGroup(sensorsWithRequestSlot),
      () => this.logHighlighter.highlightLogGroup(3),
    );

    /////////////
    sensorsWithRequestSlot = [
      { id: 5, requestSlot: 3 },
      { id: 4, requestSlot: 3 },
      { id: 0, requestSlot: 1 },
    ];
    this.tweenTimeTraveler.queueTweenGroup(
      this.#getTweenGroup(sensorsWithRequestSlot).concat([
        this.visualSensors.animateSensorToSection(1, 2, "1"),
        this.visualSensors.animateSensorToSection(2, 2, "2"),
        this.visualSensors.animateSensorToSection(3, 1),
      ]),
      () => this.logHighlighter.highlightLogGroup(4),
    );
  }

  #getTweenGroup(sensorsWithRequestSlot) {
    let requestSlotsPos = this.visualGateway.getNextRequestSlotsPos();

    return sensorsWithRequestSlot.map((elem) => {
      const anim = this.visualSensors.animateSensorToPos(
        elem.id,
        requestSlotsPos[elem.requestSlot].x,
        requestSlotsPos[elem.requestSlot].y,
        elem.text ?? "",
      );
      requestSlotsPos[elem.requestSlot].y += this.sensorRadius * 2.25;
      return anim;
    });
  }

  clearScene() {
    this.tweenTimeTraveler.clearQueue();
    this.layer.destroyChildren();
    this.logHighlighter.setLog([]);
  }
}
