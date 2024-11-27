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
      const elem = this.#createVisualLogGroup(
        "Animation " + index,
        section.join("\n"),
        () => {
          this.tweenTimeTraveler.goToGroup(index);
          this.tweenTimeTraveler.playQueue();
        },
      );
      resultContainer.appendChild(elem);
    });
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
    summaryDiv.innerText = summaryText;
    detailsDiv.appendChild(summaryDiv);

    lineContainer.appendChild(detailsDiv);
    return lineContainer;
  }

  highlightLogGroup(groupIdx) {
    const lineContainers = document.querySelectorAll(".line-container");

    if (this.prevHighlightIdx != null) {
      const summaryDiv =
        lineContainers[this.prevHighlightIdx].querySelector("summary");
      summaryDiv.innerHTML = summaryDiv.innerText;
    }

    if (groupIdx >= 0 && groupIdx < lineContainers.length) {
      const targetContainer = lineContainers[groupIdx];
      const summaryDiv = targetContainer.querySelector("summary");
      summaryDiv.innerHTML = `<mark>${summaryDiv.innerText}</mark>`;

      document.getElementById("result").scroll({
        left: 0,
        top: targetContainer.offsetTop,
        behavior: "smooth",
      });
    }

    this.prevHighlightIdx = groupIdx;
  }
}
