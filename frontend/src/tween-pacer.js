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

  stopQueue() {
    if (this.tweenGroupQueue.length) {
      this.tweenGroupQueue[this.currentGroupIndex].forEach((tween) =>
        tween.pause(),
      );
    }
  }

  playQueue() {
    if (this.currentGroupIndex >= this.tweenGroupQueue.length) {
      this.isPlaying = false;
      this.currentGroupIndex = 0;
      return;
    }

    const currentGroup = this.tweenGroupQueue[this.currentGroupIndex];
    let completedTweens = 0;

    currentGroup.forEach((tween) => {
      const originalOnFinish = tween.onFinish;
      tween.onFinish = () => {
        if (originalOnFinish) {
          originalOnFinish();
        }
        completedTweens++;
        if (completedTweens === currentGroup.length) {
          this.currentGroupIndex++;
          this.playQueue();
        }
      };
      tween.play();
    });
  }
}
