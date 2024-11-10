export class TweenTimeTraveler {
  constructor() {
    this.tweenGroupQueue = [];
    this.groupCallbacks = [];
    this.currentGroupIndex = 0;
    this.isPlaying = false;
  }

  queueTweenGroup(tweensBatch, groupCallback = null) {
    if (!Array.isArray(tweensBatch)) {
      console.error("tweensBatch must be an array");
      return this;
    }

    this.tweenGroupQueue.push(tweensBatch);
    this.groupCallbacks.push(groupCallback);
    return this;
  }

  #manageTweens(action) {
    if (this.tweenGroupQueue.length) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween[action](),
      );
    }
  }

  playQueue() {
    if (this.isPlaying) {
      this.#manageTweens("play");
      return;
    }
    this.#playGroups();
  }

  pauseQueue() {
    this.#manageTweens("pause");
  }

  goToPreviousGroup() {
    if (this.tweenGroupQueue.length && this.currentGroupIndex > 0) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween.reset(),
      );
    }
  }

  goToNextGroup() {
    if (
      this.tweenGroupQueue.length &&
      this.currentGroupIndex < this.tweenGroupQueue.length - 1
    ) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween.finish(),
      );
    }
  }

  clearQueue() {
    if (this.tweenGroupQueue.length) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween.destroy(),
      );
      this.tweenGroupQueue = [];
    }
    this.currentGroupIndex = 0;
    this.isPlaying = false;
  }

  async #playGroups() {
    this.isPlaying = true;

    while (this.currentGroupIndex < this.tweenGroupQueue.length) {
      const currentGroup = this.tweenGroupQueue[this.currentGroupIndex];

      const originalOnResetFunctions = currentGroup.map((e) => e.onReset);
      const originalOnFinishFunctions = currentGroup.map((e) => e.onFinish);

      const tweenPromise = new Promise((resolve, reject) => {
        let completedTweens = 0;

        currentGroup.forEach((tween, index) => {
          tween.reset();

          tween.onReset = () => {
            if (originalOnResetFunctions[index]) {
              originalOnResetFunctions[index]();
            }
            completedTweens++;
            if (completedTweens === currentGroup.length) {
              resolve("reset");
            }
          };

          tween.onFinish = () => {
            if (originalOnFinishFunctions[index]) {
              originalOnFinishFunctions[index]();
            }
            completedTweens++;
            if (completedTweens === currentGroup.length) {
              resolve("finished");
            }
          };

          tween.node.visible(true);
          tween.play();
        });
      });

      const value = await tweenPromise;

      currentGroup.forEach((tween, index) => {
        tween.onReset = originalOnResetFunctions[index];
        tween.onFinish = originalOnFinishFunctions[index];
        tween.node.visible(false);
      });

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
