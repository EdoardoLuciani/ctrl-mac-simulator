export class VisualGateway {
  constructor(x, y) {
    this.gateway = new Konva.Group({
      x: x,
      y: y,
    });

    this.gateway.add(
      new Konva.Circle({
        radius: 70,
        stroke: "blue",
        strokeWidth: 4,
      }),
    );

    const text = new Konva.Text({
      x: 0,
      y: 0,
      text: "Gateway",
      fontSize: 18,
      fontFamily: "Arial",
    });
    text.x(-text.width() / 2);

    this.gateway.add(text);
  }

  get shape() {
    return this.gateway;
  }
}
