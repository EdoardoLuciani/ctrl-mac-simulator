export class VisualGateway {
  constructor(x, y, requestSlots) {
    this.requestSlots = requestSlots;
    this.nextRrmXPos = 0;

    this.gateway = new Konva.Group({
      x: x,
      y: y,
    });

    this.gateway.add(
      new Konva.Text({
        text: "Gateway",
        fontSize: 18,
        fontFamily: "Arial",
      }),
    );
  }

  get shape() {
    return this.gateway;
  }

  addRrm() {
    const rrm = VisualGateway.getRrmShape(this.nextRrmXPos, 4);
    this.gateway.add(rrm);

    this.nextRrmXPos += rrm.width() + 20;
  }

  static getRrmShape(startingX, requestSlots) {
    let points = [startingX, 30];

    for (let iter = 0; iter < requestSlots; iter++) {
      points.push(
        startingX + 50 * iter,
        10,
        startingX + 50 * (iter + 1),
        10,
        startingX + 50 * (iter + 1),
        30,
      );
    }

    return new Konva.Line({
      y: 10,
      x: 5,
      points: points,
      stroke: "blue",
      strokeWidth: 3,
      lineCap: "round",
      lineJoin: "round",
    });
  }
}
