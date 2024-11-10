import { matches_started_request_reply_message } from "./helpers/log-matcher-helper";

export class LogHighligther {
  constructor(tweenTimeTraveler) {
    this.tweenTimeTraveler = tweenTimeTraveler;
    this.prevHighlightIdx = null;
  }

  setLog(inputTextLines) {
    const result = inputTextLines.reduce((acc, line) => {
      if (matches_started_request_reply_message(line)) {
        acc.push([line]);
      } else if (acc.length > 0) {
        acc[acc.length - 1].push(line);
      }
      return acc;
    }, []);

    const resultContainer = document.getElementById("result");
    resultContainer.innerHTML = "";

    result.forEach((section, index) => {
      const lineContainer = document.createElement("div");
      lineContainer.className = "line-container";

      const button = document.createElement("button");
      button.className = "line-button";
      button.textContent = "→";
      button.onclick = () => {
        this.tweenTimeTraveler.goToGroup(index);
        this.tweenTimeTraveler.playQueue();
      };
      lineContainer.appendChild(button);

      const textDiv = document.createElement("div");
      textDiv.innerText = section.join("\n");
      lineContainer.appendChild(textDiv);

      resultContainer.appendChild(lineContainer);
    });
  }

  highlightLogGroup(groupIdx) {
    const lineContainers = document.querySelectorAll(".line-container");

    if (this.prevHighlightIdx != null) {
      const textDiv =
        lineContainers[this.prevHighlightIdx].querySelector("div");
      textDiv.innerHTML = textDiv.innerText;
    }

    if (groupIdx >= 0 && groupIdx < lineContainers.length) {
      const targetContainer = lineContainers[groupIdx];
      const textDiv = targetContainer.querySelector("div");
      textDiv.innerHTML = `<mark>${textDiv.innerText}</mark>`;

      document.getElementById("result").scroll({
        left: 0,
        top: targetContainer.offsetTop,
        behavior: "smooth",
      });
    }

    this.prevHighlightIdx = groupIdx;
  }
}
