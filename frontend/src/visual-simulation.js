import Konva from "konva";
import { VisualGateway } from "./visual-gateway";

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
    const sensors = [];
    const radius = 500;

    const visualGateway = new VisualGateway(
      this.stage.width() / 2,
      this.stage.height() / 2,
    );

    const angle = (Math.PI * 2) / sensorCount;
    for (let i = 0; i < sensorCount; i++) {
      sensors.push(
        new Konva.Circle({
          x: this.stage.width() / 2 + radius * Math.cos(i * angle),
          y: this.stage.height() / 2 + radius * Math.sin(i * angle),
          radius: 30,
          stroke: "red",
        }),
      );
    }

    this.layer.add(...sensors, visualGateway.shape);
  }

  clearScene() {
    this.layer.destroyChildren();
  }
}
