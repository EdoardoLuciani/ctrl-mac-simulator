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
  }

  setupScene(sensorCount) {
    const centerX = this.layer.width() / 2;
    const centerY = this.layer.height() / 2;

    const visualGateway = new VisualGateway(centerX, centerY);

    const visualSensors = new VisualSensors(sensorCount, 500, centerX, centerY);

    this.layer.add(...visualSensors.shape, visualGateway.shape);
  }

  clearScene() {
    this.layer.destroyChildren();
  }
}
