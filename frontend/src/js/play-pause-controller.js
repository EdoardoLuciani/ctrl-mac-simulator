export class PlayPauseController {
  constructor(buttonId) {
    this.button = document.getElementById(buttonId);
    this.icon = this.button.querySelector("i");
    this.state = "paused";

    this.states = {
      paused: {
        nextState: "playing",
        iconRemove: "fa-play",
        iconAdd: "fa-pause",
      },
      playing: {
        nextState: "paused",
        iconRemove: "fa-pause",
        iconAdd: "fa-play",
      },
    };
  }

  toggle() {
    const currentState = this.states[this.state];
    this.state = currentState.nextState;

    this.icon.classList.remove(currentState.iconRemove);
    this.icon.classList.add(currentState.iconAdd);
    this.button.dataset.state = this.state;

    return this.state;
  }

  setState(newState) {
    if (this.state !== newState && this.states[newState]) {
      this.state = newState === "playing" ? "paused" : "playing";
      this.toggle();
    }
  }

  isPlaying() {
    return this.state === "playing";
  }
}
