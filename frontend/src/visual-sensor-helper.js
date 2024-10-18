export function buildSensor(x, y, sensorRadius, sensorId) {
  const group = new Konva.Group({
    x: x,
    y: y,
  });

  group.add(
    new Konva.Circle({
      radius: sensorRadius,
      stroke: "red",
    }),
  );

  const text = new Konva.Text({
    text: `S${sensorId}`,
    fontSize: 18,
    fontFamily: "Arial",
  });
  text.x(-text.width() / 2);
  text.y(-text.height() / 2);

  group.add(text);

  return group;
}
