export class VisualGateway {
  constructor(x, y, maxWidth, requestSlots) {
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

    this.tickYOffset = 10;
    this.tickWidth = 50;
    this.tickHeight = 20;
    this.requestSlots = requestSlots;
    this.rrmPadding = 20;

    let nextRrmXPos = 0;
    while (nextRrmXPos < maxWidth) {
      const rrm = this.#getRrmShape(
        nextRrmXPos,
        this.tickYOffset,
        this.tickWidth,
        this.tickHeight,
        this.requestSlots,
      );
      this.gateway.add(rrm);

      nextRrmXPos += rrm.width() + this.rrmPadding;
    }

    this.currentRrm = -1;
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

  #getRrmShape(startingX, startingY, tickWidth, tickHeight, requestSlots) {
    let points = [startingX, startingY + tickHeight];

    for (let iter = 0; iter < requestSlots; iter++) {
      points.push(
        startingX + tickWidth * iter,
        startingY,
        startingX + tickWidth * (iter + 1),
        startingY,
        startingX + tickWidth * (iter + 1),
        startingY + tickHeight,
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
