import Konva from "konva";
import { VisualGateway } from "./visual-gateway";
import { buildSensorArray } from "./helpers/build-sensor-array";
import { VisualSensor } from "./visual-sensor";
import { TweenTimeTraveler } from "./tween-time-traveler";
import { LogHighligther } from "./log-highlighter";
import * as logMatcher from "./helpers/log-matcher-helper";

export class Scene {
  constructor(containerId) {
    const container = document.getElementById(containerId);

    this.stage = new Konva.Stage({
      container: containerId,
      width: container.clientWidth,
      height: container.clientWidth,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.centerX = this.layer.width() / 2;
    this.centerY = this.layer.height() / 2;

    this.sensorRadius = this.layer.width() / 2.5;

    this.tweenTimeTraveler = new TweenTimeTraveler();
    this.logHighlighter = new LogHighligther(this.tweenTimeTraveler);
  }

  setupScene(sensorCount, log) {
    this.visualGateway = new VisualGateway(this.centerX, this.centerY);
    this.visualSensors = buildSensorArray(
      sensorCount,
      this.sensorRadius,
      this.centerX,
      this.centerY,
    );

    this.layer.add(
      ...this.visualSensors.map((e) => e.shape).flat(),
      ...this.visualGateway.shape,
    );

    this.logHighlighter.setLog(log);

    const logGroups = log.reduce((acc, line) => {
      if (logMatcher.matches_started_request_reply_message(line)) {
        acc.push([line]);
      } else {
        acc[acc.length - 1].push(line);
      }
      return acc;
    }, []);

    const sensorsBackoffs = Array(sensorCount).fill(null);

    logGroups.forEach((group_lines, index) => {
      const previousBackoffs = [...sensorsBackoffs];

      this.tweenTimeTraveler.queueTweenGroup(
        [this.visualGateway.animateRequestReplyMessage(this.sensorRadius)],
        () => {
          this.logHighlighter.highlightLogGroup(2 * index);
          this.#updateSensorBackoffs(previousBackoffs);
        },
      );

      let queueGroup = [];

      group_lines.forEach((line) => {
        let result = null;

        if (
          (result =
            logMatcher.matches_started_transmission_request_message(line))
        ) {
          queueGroup.push(
            this.visualSensors[result.sensorIndex].animateTransmissionRequest(
              this.centerX,
              this.centerY,
              result.requestSlot,
            ),
          );
          sensorsBackoffs[result.sensorIndex] = null;
        } else if (
          (result = logMatcher.matches_started_sensor_measurement_message(line))
        ) {
          queueGroup.push(
            this.visualSensors[result.sensorIndex].animateDataTransmission(
              this.centerX,
              this.centerY,
            ),
          );
          sensorsBackoffs[result.sensorIndex] = null;
        } else if (
          (result = logMatcher.matches_on_timeout_for_x_periods(line))
        ) {
          sensorsBackoffs[result.sensorIndex] = String(
            Number(result.timeoutPeriod) + 1,
          );
        }
      });

      const updatedBackoffs = [...sensorsBackoffs];

      this.tweenTimeTraveler.queueTweenGroup(queueGroup, () => {
        this.logHighlighter.highlightLogGroup(2 * index + 1);
        this.#updateSensorBackoffs(updatedBackoffs);
      });
    });
  }

  #updateSensorBackoffs(backoffs) {
    backoffs.forEach((value, i) => {
      this.visualSensors[i].setSubscript(value);
      this.visualSensors[i].setColor(value == null ? "green" : "red");
    });
  }

  clearScene() {
    this.tweenTimeTraveler.clearQueue();
    this.layer.destroyChildren();
    this.logHighlighter.setLog([]);
  }
}
