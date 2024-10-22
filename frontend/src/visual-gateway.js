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

    this.tickYOffset = 20;
    this.tickWidth = 50;
    this.tickHeight = 20;
    this.requestSlots = requestSlots;
    this.rrmPadding = 20;

    let nextRrmXPos = 5;
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
    return [this.gateway];
  }

  getNextRequestSlotsPos() {
    this.currentRrm += 1;
    this.currentRrm = this.currentRrm % (this.gateway.getChildren().length - 1);

    const currentRrm = this.gateway.getChildren()[this.currentRrm + 1];

    const slotWidth = currentRrm.width() / this.requestSlots;

    return Array.from({ length: this.requestSlots }, (_, i) => ({
      x: currentRrm.x() + slotWidth * (i + 0.5),
      y: currentRrm.y() + currentRrm.height(),
    }));
  }

  #getRrmShape(startingX, startingY, tickWidth, tickHeight, requestSlots) {
    let points = [0, tickHeight];

    for (let iter = 0; iter < requestSlots; iter++) {
      points.push(
        tickWidth * iter,
        0,
        tickWidth * (iter + 1),
        0,
        tickWidth * (iter + 1),
        tickHeight,
      );
    }

    return new Konva.Line({
      x: startingX,
      y: startingY,
      points: points,
      stroke: "blue",
      strokeWidth: 3,
      lineCap: "round",
      lineJoin: "round",
    });
  }
}
