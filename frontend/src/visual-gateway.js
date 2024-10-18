export class VisualGateway {
  static tickLength = 50;
  static tickHeight = 20;
  static tickYOffset = 10;
  static RrmPadding = 20;

  constructor(x, y, maxWidth, requestSlots) {
    this.requestSlots = requestSlots;
    this.currentRrm = -1;

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

    let nextRrmXPos = 0;
    while (nextRrmXPos < maxWidth) {
      const rrm = this.#getRrmShape(nextRrmXPos);
      this.gateway.add(rrm);

      nextRrmXPos += rrm.width() + VisualGateway.RrmPadding;
    }
  }

  get shape() {
    return this.gateway;
  }

  getNextRequestSlotsPos() {
    this.currentRrm += 1;
    this.currentRrm = this.currentRrm % (this.gateway.getChildren().length - 1);

    const currentRrm = this.gateway.getChildren()[this.currentRrm];

    let res = [];
    for (let i = 0; i < this.requestSlots; i++) {
      res.push({
        x: currentRrm.x() + (currentRrm.width() / this.requestSlots) * i,
        y: currentRrm.y(),
      });
    }
    return res;
  }

  #getRrmShape(startingX) {
    let points = [
      startingX,
      VisualGateway.tickYOffset + VisualGateway.tickHeight,
    ];

    for (let iter = 0; iter < this.requestSlots; iter++) {
      points.push(
        startingX + VisualGateway.tickLength * iter,
        VisualGateway.tickYOffset,
        startingX + VisualGateway.tickLength * (iter + 1),
        VisualGateway.tickYOffset,
        startingX + VisualGateway.tickLength * (iter + 1),
        VisualGateway.tickYOffset + VisualGateway.tickHeight,
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
