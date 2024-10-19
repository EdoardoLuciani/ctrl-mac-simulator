export class LogHighligther {
  constructor() {}

  get text() {
    return document.getElementById("result").textContent;
  }

  set text(x) {
    document.getElementById("result").textContent = x;
  }
}
