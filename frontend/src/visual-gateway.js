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
      text: "Gateway",
      fontSize: 18,
      fontFamily: "Arial",
    });
    text.x(-text.width() / 2);
    text.y(-text.height() / 2);

    this.gateway.add(text);
  }

  get shape() {
    return this.gateway;
  }

  animateRequestReplyMessage(circleRadius) {
    const layer = this.gateway.getLayer();

    const messageCircle = new Konva.Circle({
      x: this.gateway.x(),
      y: this.gateway.y(),
      radius: 80,
      stroke: "#ebe834",
      strokeWidth: 4,
      visible: false,
    });
    layer.add(messageCircle);

    return new Konva.Tween({
      node: messageCircle,
      duration: 1,
      radius: circleRadius,
      easing: Konva.Easings.Linear(),
      onFinish: () => {
        layer.batchDraw();
      },
    });
  }
}
