import * as logMatcher from "./helpers/log-matcher-helper";

export class LogHighligther {
  constructor(goToGroupCallback) {
    this.goToGroupCallback = goToGroupCallback;
    this.prevHighlightIdx = null;

    const canvasColumn = document.getElementById("canvas-column");
    const result = document.getElementById("result");
    if (canvasColumn && result) {
      result.style.height = `${canvasColumn.offsetHeight - 450}px`;
    }
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

    this.prevHighlightIdx = null;
    const resultContainer = document.getElementById("result");
    resultContainer.innerHTML = "";

    // Dynamically determined by the first rrm message processed by the simulator
    let requestSlotsCount = null;

    logGroups.forEach((section, index) => {
      const cycleNo = Math.floor(index / 2);
      const time = logMatcher.matches_any_line(section[0]);
      const isSensorGroup = index % 2;

      let groupDesc = "";
      if (isSensorGroup) {
        const sectionCounts = new Array(requestSlotsCount).fill(null);
        section.forEach((e) => {
          const match =
            logMatcher.matches_started_transmission_request_message(e);
          if (match) {
            sectionCounts[match.requestSlot] =
              (sectionCounts[match.requestSlot] || 0) + 1;
          }
        });

        const noCollisionSlots = [];
        const collisionSlots = [];
        sectionCounts.forEach((elem, idx) => {
          if (elem > 1) {
            collisionSlots.push(idx);
          } else if (elem === 1) {
            noCollisionSlots.push(idx);
          }
        });

        if (noCollisionSlots.length) {
          groupDesc += `Uncontented slots: ${noCollisionSlots.toString()}`;
        }

        if (noCollisionSlots.length && collisionSlots.length) {
          groupDesc += " | ";
        }

        if (collisionSlots.length) {
          groupDesc += `Contented slots: ${collisionSlots.toString()}`;
        }

        if (groupDesc === "") {
          groupDesc = "No sensor sent a transmission request message";
        }
      } else {
        const debugMessage = section.find((e) =>
          logMatcher.matches_debug_rrm_message(e),
        );
        const debugJson = JSON.parse(
          debugMessage.slice(debugMessage.indexOf("{")),
        );
        requestSlotsCount = debugJson["request_slots"].length;
        groupDesc =
          debugJson["request_slots"]
            .map(
              (e) =>
                `<span class="${e["state"]}-rrm-status-text">${e["state"]}</span>`,
            )
            .join("|") + ` FTR: ${debugJson["ftr"]}`;
      }

      const elem = this.#createVisualLogGroup(
        `Cycle: ${cycleNo} | Time: ${time} | ${isSensorGroup ? "Sensor Slots Collisions" : "RRM Slots Status"}:<br> ${groupDesc}`,
        this.#processLogGroup(section),
        index,
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

  #createVisualLogGroup(summaryText, detailsText, index) {
    const lineContainer = document.createElement("div");
    lineContainer.className = "line-container";

    const button = document.createElement("button");
    button.className = "line-button";
    button.textContent = "→";
    button.onclick = () => {
      this.goToGroupCallback(index);
    };
    lineContainer.appendChild(button);

    const details = document.createElement("details");

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "details-content";
    detailsDiv.innerHTML = "<hr>" + detailsText;
    details.appendChild(detailsDiv);

    const summary = document.createElement("summary");
    summary.innerHTML = summaryText;
    details.appendChild(summary);

    lineContainer.appendChild(details);
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

      targetContainer.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    this.prevHighlightIdx = groupIdx;
  }
}
