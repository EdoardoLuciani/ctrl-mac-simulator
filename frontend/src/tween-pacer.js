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
    if (this.currentGroupIndex >= this.tweenGroupQueue.length) {
      this.isPlaying = false;
      this.currentGroupIndex = 0;
      return;
    }

    const currentGroup = this.tweenGroupQueue[this.currentGroupIndex];

    let completedTweens = new Uint8Array(1);

    currentGroup.forEach((tween) => {
      const originalOnFinish = tween.onFinish;
      tween.onFinish = () => {
        if (originalOnFinish) {
          originalOnFinish();
        }

        Atomics.add(completedTweens, 0, 1);
        if (Atomics.load(completedTweens, 0) === currentGroup.length) {
          this.currentGroupIndex++;
          this.playQueue();
        }
      };

      tween.node.visible(true);
      tween.play();
    });
  }

  pauseQueue() {
    if (this.tweenGroupQueue.length) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween.pause(),
      );
    }
  }

  reverseCurrentGroupToStart() {
    if (this.tweenGroupQueue.length) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween.reset(),
      );
    }
  }

  fastForwardCurrentGroupToFinish() {
    if (this.tweenGroupQueue.length) {
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
}
