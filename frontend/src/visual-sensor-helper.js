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

  const sensorIdText = new Konva.Text({
    text: `S${sensorId}`,
    fontSize: 18,
    fontFamily: "Arial",
  });
  sensorIdText.x(-sensorIdText.width() / 2);
  sensorIdText.y(-sensorIdText.height() / 2);
  group.add(sensorIdText);

  const sensorSubscript = new Konva.Text({
    text: `x`,
    fontSize: 14,
    fontFamily: "Arial",
  });
  sensorSubscript.x(-sensorSubscript.width() / 2);
  sensorSubscript.y(sensorSubscript.height() / 2.5);
  group.add(sensorSubscript);

  return group;
}
