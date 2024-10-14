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

  reverseCurrentGroupToStart() {
    if (this.tweenGroupQueue.length) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) => {
        tween.reset();
      });

      if (this.currentGroupIndex) {
        this.currentGroupIndex--;
      }

      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) => {
        tween.reset();
        tween.play();
      });
    }
  }

  fastForwardCurrentGroupToFinish() {
    if (
      this.tweenGroupQueue.length &&
      this.currentGroupIndex < this.tweenGroupQueue.length - 1
    ) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween.finish(),
      );

      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) => {
        tween.reset();
        tween.play();
      });
    }
  }

  clearQueue() {
    this.pauseQueue();
    this.tweenGroupQueue = [];
    this.currentGroupIndex = 0;
    this.isPlaying = false;
  }

  #playNextGroup() {
    if (this.currentGroupIndex >= this.tweenGroupQueue.length) {
      this.isPlaying = false;
      this.currentGroupIndex = 0;
      return;
    }

    const currentGroup = this.tweenGroupQueue[this.currentGroupIndex];

    let completedTweens = 0;

    currentGroup.forEach((tween) => {
      tween.onReset = () => {
        completedTweens = 0;
      };

      const originalOnFinish = tween.onFinish;
      tween.onFinish = () => {
        if (originalOnFinish) {
          originalOnFinish();
        }

        completedTweens++;
        if (completedTweens === currentGroup.length) {
          this.currentGroupIndex++;
          this.#playNextGroup();
        }
      };

      tween.node.visible(true);
      tween.play();
    });
  }
}
