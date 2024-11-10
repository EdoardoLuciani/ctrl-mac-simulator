import Konva from "konva";
import { VisualGateway } from "./visual-gateway";
import { VisualSensors } from "./visual-sensors";
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

    this.centerX = this.layer.width() / 2;
    this.centerY = this.layer.height() / 2;

    this.sensorRadius = this.layer.width() / 2.5;

    this.tweenTimeTraveler = new TweenTimeTraveler();
    this.logHighlighter = new LogHighligther(this.tweenTimeTraveler);
  }

  setupScene(sensorCount, log) {
    this.visualGateway = new VisualGateway(this.centerX, this.centerY);
    this.visualSensors = new VisualSensors(
      sensorCount,
      this.sensorRadius,
      this.centerX,
      this.centerY,
    );

    this.layer.add(this.visualSensors.shape, this.visualGateway.shape);
    this.logHighlighter.setLog(log);
  }

  playAnimations() {
    this.tweenTimeTraveler.queueTweenGroup(
      [this.visualGateway.animateRequestReplyMessage(this.sensorRadius)],
      () => {
        this.logHighlighter.highlightLogGroup(0);
        this.visualSensors.clearAllSensorSubscripts();
      },
    );

    this.tweenTimeTraveler.queueTweenGroup(
      [this.visualGateway.animateRequestReplyMessage(this.sensorRadius)],
      () => {
        this.logHighlighter.highlightLogGroup(1);
        this.visualSensors.clearAllSensorSubscripts();
      },
    );
    this.tweenTimeTraveler.queueTweenGroup(
      this.#getTransmissionRequestAnimations({
        0: 4,
        1: 1,
        2: 2,
        3: 5,
        4: 3,
        5: 0,
      }),
      () => {
        this.logHighlighter.highlightLogGroup(1);
        this.visualSensors.clearAllSensorSubscripts();
      },
    );

    this.tweenTimeTraveler.queueTweenGroup(
      [this.visualGateway.animateRequestReplyMessage(this.sensorRadius)],
      () => {
        this.logHighlighter.highlightLogGroup(2);
        this.visualSensors.clearAllSensorSubscripts();
      },
    );
    this.tweenTimeTraveler.queueTweenGroup(
      this.#getTransmissionRequestAnimations({
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
      }),
      () => {
        this.logHighlighter.highlightLogGroup(2);
        this.visualSensors.clearAllSensorSubscripts();
      },
    );

    this.tweenTimeTraveler.queueTweenGroup(
      [this.visualGateway.animateRequestReplyMessage(this.sensorRadius)],
      () => {
        this.logHighlighter.highlightLogGroup(3);
        this.visualSensors.clearAllSensorSubscripts();
      },
    );

    this.tweenTimeTraveler.queueTweenGroup(
      [this.visualGateway.animateRequestReplyMessage(this.sensorRadius)],
      () => {
        this.logHighlighter.highlightLogGroup(4);
        this.visualSensors.clearAllSensorSubscripts();
      },
    );
    this.tweenTimeTraveler.queueTweenGroup(
      this.#getTransmissionRequestAnimations({
        0: 5,
        1: 4,
        2: 4,
        3: 3,
        4: 5,
        5: 5,
      }),
      () => {
        this.logHighlighter.highlightLogGroup(4);
        this.visualSensors.clearAllSensorSubscripts();
      },
    );

    this.tweenTimeTraveler.queueTweenGroup(
      [this.visualGateway.animateRequestReplyMessage(this.sensorRadius)],
      () => {
        this.logHighlighter.highlightLogGroup(5);
        this.visualSensors.clearAllSensorSubscripts();
      },
    );
    this.tweenTimeTraveler.queueTweenGroup(
      this.#getTransmissionRequestAnimations({
        0: 1,
        3: null,
        4: 3,
        5: 3,
      }),
      () => {
        this.logHighlighter.highlightLogGroup(5);
        this.visualSensors.clearAllSensorSubscripts();
        this.visualSensors.setSensorSubscript(1, 1);
        this.visualSensors.setSensorSubscript(2, 1);
      },
    );

    this.tweenTimeTraveler.queueTweenGroup(
      [this.visualGateway.animateRequestReplyMessage(this.sensorRadius)],
      () => {
        this.logHighlighter.highlightLogGroup(5);
        this.visualSensors.clearAllSensorSubscripts();
        this.visualSensors.setSensorSubscript(1, 1);
        this.visualSensors.setSensorSubscript(2, 1);
      },
    );
    this.tweenTimeTraveler.queueTweenGroup(
      this.#getTransmissionRequestAnimations({
        0: null,
        1: 0,
        2: 2,
      }),
      () => {
        this.logHighlighter.highlightLogGroup(6);
        this.visualSensors.clearAllSensorSubscripts();
        this.visualSensors.setSensorSubscript(5, 1);
        this.visualSensors.setSensorSubscript(4, 1);
      },
    );

    this.tweenTimeTraveler.playQueue();
  }

  #getTransmissionRequestAnimations(sensorToSlot) {
    return Object.entries(sensorToSlot).map(([key, value]) => {
      if (typeof value == "number") {
        return this.visualSensors.animateTransmissionRequest(
          key,
          this.centerX,
          this.centerY,
          value,
        );
      } else {
        return this.visualSensors.animateDataTransmission(
          key,
          this.centerX,
          this.centerY,
        );
      }
    });
  }

  clearScene() {
    this.tweenTimeTraveler.clearQueue();
    this.layer.destroyChildren();
    this.logHighlighter.setLog([]);
  }
}
