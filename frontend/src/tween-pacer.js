export class TweenPacer {
  constructor() {
    this.tweenGroupQueue = [];
    this.currentGroupIndex = 0;
    this.isPlaying = false;
  }

  queueTweenGroup(...tweensBatch) {
    this.tweenGroupQueue.push(tweensBatch);
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
    if (this.tweenGroupQueue.length) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween.pause(),
      );
    }
  }

  resumeQueue() {
    if (this.tweenGroupQueue.length) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween.play(),
      );
    }
  }

  rollbackToPreviousGroup() {
    if (this.tweenGroupQueue.length) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) => {
        tween.reset();
      });
    }
  }

  fastForwardToNextGroup() {
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
    this.pauseQueue();
    this.tweenGroupQueue = [];
    this.currentGroupIndex = 0;
    this.isPlaying = false;
  }

  async #playNextGroup() {
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
        tween.node.hide();
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
