export class VisualGateway {
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

      nextRrmXPos += rrm.width() + 20;
    }
  }

  get shape() {
    return this.gateway;
  }

  getNextRrmIndex() {
    this.currentRrm += 1;
    return this.currentRrm % (this.gateway.getChildren().length - 1);
  }

  #getRrmShape(startingX) {
    let points = [startingX, 30];

    for (let iter = 0; iter < this.requestSlots; iter++) {
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
