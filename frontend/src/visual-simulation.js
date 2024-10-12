import Konva from "konva";

const divSize = document.getElementById("canvasColumn").clientWidth;

var stage = new Konva.Stage({
  container: "canvasColumn", // id of container <div>
  width: divSize,
  height: divSize,
});
var layer = new Konva.Layer();
stage.add(layer);

export function setupCanvas(sensorCount) {
  var gateway = new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: 70,
    stroke: "blue",
    strokeWidth: 4,
  });

  const sensors = [];
  const radius = 500;

  const angle = (Math.PI * 2) / sensorCount;
  for (let i = 0; i < sensorCount; i++) {
    sensors.push(
      new Konva.Circle({
        x: stage.width() / 2 + radius * Math.cos(i * angle),
        y: stage.height() / 2 + radius * Math.sin(i * angle),
        radius: 30,
        stroke: "red",
      }),
    );
  }

  layer.add(...sensors, gateway);
}

export function clearCanvas() {
  layer.destroyChildren();
}
