import * as logMatcher from "./helpers/log-matcher-helper";

export class LogHighligther {
  constructor(tweenTimeTraveler) {
    this.tweenTimeTraveler = tweenTimeTraveler;
    this.prevHighlightIdx = null;
  }

  setLog(log) {
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

    const resultContainer = document.getElementById("result");
    resultContainer.innerHTML = "";

    logGroups.forEach((section, index) => {
      const cycleNo = Math.floor(index / 2);
      const time = logMatcher.matches_any_line(section[0]);
      const isSensorGroup = index % 2;

      let groupDesc;
      if (isSensorGroup) {
        groupDesc = "sensor";
      } else {
        const debugMessage = section.find((e) =>
          logMatcher.matches_debug_rrm_message(e),
        );
        const debugJson = JSON.parse(
          debugMessage.slice(debugMessage.indexOf("{")),
        );
        const stringValue = debugJson["request_slots"]
          .map(
            (e) =>
              `<span class="${e["state"]}-rrm-status-text">${e["state"]}</span>`,
          )
          .join("|");
        groupDesc = stringValue;
      }

      const elem = this.#createVisualLogGroup(
        `Cycle: ${cycleNo} | Time: ${time} | ${isSensorGroup ? "Sensor" : "RRM Slots Status"}:<br> ${groupDesc}`,
        this.#processLogGroup(section),
        () => {
          this.tweenTimeTraveler.goToGroup(index);
          this.tweenTimeTraveler.playQueue();
        },
      );
      resultContainer.appendChild(elem);
    });
  }

  #processLogGroup(logGroup) {
    return logGroup
      .filter((e) => logMatcher.matches_debug_log(e))
      .map((e) => e.slice(e.indexOf(":") + 2))
      .join("\n");
  }

  #createVisualLogGroup(summaryText, detailsText, buttonCallback) {
    const lineContainer = document.createElement("div");
    lineContainer.className = "line-container";

    const button = document.createElement("button");
    button.className = "line-button";
    button.textContent = "→";
    button.onclick = buttonCallback;
    lineContainer.appendChild(button);

    const detailsDiv = document.createElement("details");
    detailsDiv.innerText = detailsText;

    const summaryDiv = document.createElement("summary");
    summaryDiv.innerHTML = summaryText;
    detailsDiv.appendChild(summaryDiv);

    lineContainer.appendChild(detailsDiv);
    return lineContainer;
  }

  highlightLogGroup(groupIdx) {
    const lineContainers = document.querySelectorAll(".line-container");

    if (this.prevHighlightIdx != null) {
      const currentLineContainer = lineContainers[this.prevHighlightIdx];
      currentLineContainer.querySelector("summary").innerHTML =
        currentLineContainer.querySelector("mark").innerHTML;
    }

    if (groupIdx >= 0 && groupIdx < lineContainers.length) {
      const targetContainer = lineContainers[groupIdx];
      const summaryDiv = targetContainer.querySelector("summary");
      summaryDiv.innerHTML = `<mark>${summaryDiv.innerHTML}</mark>`;

      document.getElementById("result").scroll({
        left: 0,
        top: targetContainer.offsetTop,
        behavior: "smooth",
      });
    }

    this.prevHighlightIdx = groupIdx;
  }
}
