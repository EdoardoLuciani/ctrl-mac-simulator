export class TweenPacer {
  constructor() {
    this.stepsGroups = [];
    this.groupCallbacks = [];

    this.currentGroupIndex = 0;

    this.currentTweenGroup = [];

    this.isPlaying = false;
  }

  queueTweenGroup(tweensBatch, groupCallback = null) {
    if (!Array.isArray(tweensBatch)) {
      console.error("tweensBatch must be an array");
      return this;
    }

    this.stepsGroups.push(tweensBatch);
    this.groupCallbacks.push(groupCallback);
    return this;
  }

  playQueue() {
    if (this.isPlaying) {
      console.warn("Queue is already playing! Skipping play request");
      return;
    }
    this.#playNextGroup();
  }

  pauseQueue() {
    if (this.currentTweenGroup.length) {
      this.currentTweenGroup.forEach((tween) => tween.pause());
    }
  }

  resumeQueue() {
    if (this.currentTweenGroup.length) {
      this.currentTweenGroup.forEach((tween) => tween.play());
    }
  }

  rollbackToPreviousGroup() {
    if (this.currentTweenGroup.length && this.currentGroupIndex > 0) {
      this.currentTweenGroup.forEach((tween) => tween.reset());
    }
  }

  fastForwardToNextGroup() {
    if (
      this.currentTweenGroup.length &&
      this.currentGroupIndex < this.stepsGroups.length - 1
    ) {
      this.currentTweenGroup.forEach((tween) => tween.finish());
    }
  }

  clearQueue() {
    if (this.currentTweenGroup.length) {
      this.currentTweenGroup.forEach((tween) => tween.destroy());
      this.currentTweenGroup = [];
    }
    this.stepsGroups = [];
    this.currentGroupIndex = 0;
    this.isPlaying = false;
  }

  async #playNextGroup() {
    this.isPlaying = true;

    while (this.currentGroupIndex < this.stepsGroups.length) {
      const currentGroup = this.stepsGroups[this.currentGroupIndex];

      const tweenPromise = new Promise((resolve, reject) => {
        let completedTweens = 0;

        this.currentTweenGroup = currentGroup.map((step, index) => {
          const tweenConstructor = step["tweenConstructor"];

          tweenConstructor["node"].position({
            x: step["x"],
            y: step["y"],
          });

          const tween = new Konva.Tween(tweenConstructor);

          tween.onReset = () => {
            if (tweenConstructor.onReset) {
              tweenConstructor.onReset();
            }
            completedTweens++;
            if (completedTweens === currentGroup.length) {
              resolve("reset");
            }
          };

          tween.onFinish = () => {
            if (tweenConstructor.onFinish) {
              tweenConstructor.onFinish();
            }
            completedTweens++;
            if (completedTweens === currentGroup.length) {
              resolve("finished");
            }
          };

          tween.play();

          return tween;
        });
      });

      const value = await tweenPromise;

      this.currentTweenGroup.forEach((tween) => tween.destroy());
      this.currentTweenGroup = [];

      const callback = this.groupCallbacks[this.currentGroupIndex];
      if (callback) {
        callback();
      }

      if (value === "finished") {
        this.currentGroupIndex++;
      } else {
        this.currentGroupIndex--;
      }
    }

    this.isPlaying = false;
    this.currentGroupIndex = 0;
  }
}
