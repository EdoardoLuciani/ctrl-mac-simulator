export class LogHighligther {
  constructor() {}

  get text() {
    return document.getElementById("result").textContent;
  }

  set text(x) {
    document.getElementById("result").textContent = x;
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
