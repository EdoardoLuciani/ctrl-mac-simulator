export class LogHighligther {
  constructor(tweenPacer) {
    this.tweenPacer = tweenPacer;
  }

  get text() {
    return document.getElementById("result").textContent;
  }

  set text(x) {
    document.getElementById("result").textContent = x;

    const buttonContainer = document.getElementById("sectionButtons");
    buttonContainer.innerHTML = ""; // Clear existing buttons

    this.text.split("\n").forEach((section, index) => {
      const button = document.createElement("button");
      button.textContent = index;
      button.addEventListener("click", () => {
        this.tweenPacer.goToGroup(index);
      });
      buttonContainer.appendChild(button);
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
