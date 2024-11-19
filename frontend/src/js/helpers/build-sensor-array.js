import { VisualSensor } from "../visual-sensor";

export function buildSensorArray(sensorCount, radius, x, y) {
  const angle = (Math.PI * 2) / sensorCount;

  const sensors = [];

  for (let i = 0; i < sensorCount; i++) {
    sensors.push(
      new VisualSensor(
        x + radius * Math.cos(i * angle),
        y + radius * Math.sin(i * angle),
        `S${i}`,
        x,
        y,
      ),
    );
  }

  return sensors;
}
