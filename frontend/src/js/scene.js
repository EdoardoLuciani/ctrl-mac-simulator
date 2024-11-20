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

    const logGroups = log.reduce((acc, line) => {
      if (logMatcher.matches_started_request_reply_message(line)) {
        acc.push([line]);
      } else if (logMatcher.matches_finished_request_reply_message(line)) {
        acc[acc.length - 1].push(line);
        acc.push([]);
      } else if (acc.length > 0) {
        acc[acc.length - 1].push(line);
      }
      return acc;
    }, []);

    this.logHighlighter.setLog(logGroups);

    logGroups.forEach((cycle_lines, index) => {
      const queueGroup = [];
      const sensorsBackoff = new Map();

      cycle_lines.forEach((line) => {
        let result = null;

        if (logMatcher.matches_started_request_reply_message(line)) {
          queueGroup.push(
            this.visualGateway.animateRequestReplyMessage(this.sensorRadius),
          );
        } else if (
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
          sensorsBackoff.set(result.sensorIndex, null);
        } else if (
          (result = logMatcher.matches_started_sensor_measurement_message(line))
        ) {
          queueGroup.push(
            this.visualSensors[result.sensorIndex].animateDataTransmission(
              this.centerX,
              this.centerY,
            ),
          );
        } else if (
          (result = logMatcher.matches_on_timeout_for_x_periods(line))
        ) {
          sensorsBackoff.set(
            result.sensorIndex,
            String(Number(result.timeoutPeriod) + 1),
          );
        }
      });

      this.tweenTimeTraveler.queueTweenGroup(queueGroup, () => {
        this.logHighlighter.highlightLogGroup(index);

        for (let [key, value] of sensorsBackoff.entries()) {
          this.visualSensors[key].setSubscript(value);
          this.visualSensors[key].setColor(value == null ? "green" : "red");
        }
      });
    });
  }

  #clearAllSensorsSubscripts() {
    this.visualSensors.forEach((e) => e.setSubscript(null));
  }

  #getTransmissionRequestAnimations(sensorToSlot) {
    return Object.entries(sensorToSlot).map(([key, value]) => {
      if (typeof value == "number") {
        return this.visualSensors[key].animateTransmissionRequest(
          this.centerX,
          this.centerY,
          value,
        );
      } else {
        return this.visualSensors[key].animateDataTransmission(
          this.centerX,
          this.centerY,
        );
      }
    });
  }

  clearScene() {
    this.tweenTimeTraveler.clearQueue();
    this.layer.destroyChildren();
    this.logHighlighter.setLog([]);
  }
}
