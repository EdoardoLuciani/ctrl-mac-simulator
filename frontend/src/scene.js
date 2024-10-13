import Konva from "konva";
import { VisualGateway } from "./visual-gateway";
import { VisualSensors } from "./visual-sensors";

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
  }

  setupScene(sensorCount) {
    this.visualGateway = new VisualGateway(this.centerX, this.centerY);
    this.visualSensors = new VisualSensors(
      sensorCount,
      this.sensorRadius,
      this.centerX,
      this.centerY,
    );

    this.layer.add(this.visualSensors.shape, this.visualGateway.shape);
  }

  playAnimations() {
    this.visualSensors.animateTransmissionRequest(
      0,
      this.centerX,
      this.centerY,
    );

    this.visualSensors.animateDataTransmission(1, this.centerX, this.centerY);
    this.visualSensors.animateDataTransmission(2, this.centerX, this.centerY);
    this.visualSensors.animateDataTransmission(3, this.centerX, this.centerY);

    this.visualGateway.animateRequestReplyMessage(this.sensorRadius);
  }

  pauseAnimations() {
    this.visualSensors.pauseAnimations();
  }

  resumeAnimations() {
    this.visualSensors.resumeAnimations();
  }

  clearScene() {
    this.layer.destroyChildren();
  }
}
