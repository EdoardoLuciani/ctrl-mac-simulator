export class VisualGateway {
  constructor(x, y) {
    this.gateway = new Konva.Circle({
      x: x,
      y: y,
      radius: 70,
      stroke: "blue",
      strokeWidth: 4,
    });
  }

  get shape() {
    return this.gateway;
  }
}
