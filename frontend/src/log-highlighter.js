import { matches_started_request_reply_message } from "./helpers/log-matcher-helper";

export class LogHighligther {
  constructor(tweenPacer) {
    this.tweenPacer = tweenPacer;
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
        this.tweenPacer.goToGroup(index);
      };
      lineContainer.appendChild(button);

      const textDiv = document.createElement("div");
      textDiv.innerText = section.join("\n");
      lineContainer.appendChild(textDiv);

      resultContainer.appendChild(lineContainer);
    });
  }

  highlightLines(startLine, endLine) {
    const lines = this.text.split("\n");

    // Highlight the specified lines
    for (
      let i = Math.max(startLine - 1, 0);
      i < Math.min(endLine, lines.length);
      i++
    ) {
      lines[i] = `<mark>${lines[i]}</mark>`;
    }

    document.getElementById("result").innerHTML = lines.join("\n");
  }
}
