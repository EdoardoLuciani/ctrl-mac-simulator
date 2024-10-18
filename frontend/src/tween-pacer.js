export class TweenPacer {
  constructor() {
    this.tweenGroupConstructors = [];
    this.currentGroupIndex = 0;

    this.currentTweenGroup = [];

    this.isPlaying = false;
  }

  queueTweenGroup(...tweensBatch) {
    this.tweenGroupConstructors.push(tweensBatch);
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
      this.currentGroupIndex < this.tweenGroupConstructors.length - 1
    ) {
      this.currentTweenGroup.forEach((tween) => tween.finish());
    }
  }

  clearQueue() {
    if (this.currentTweenGroup.length) {
      this.currentTweenGroup.forEach((tween) => tween.destroy());
      this.currentTweenGroup = [];
    }
    this.tweenGroupConstructors = [];
    this.currentGroupIndex = 0;
    this.isPlaying = false;
  }

  async #playNextGroup() {
    this.isPlaying = true;

    while (this.currentGroupIndex < this.tweenGroupConstructors.length) {
      const currentGroupConstructors =
        this.tweenGroupConstructors[this.currentGroupIndex];

      const tweenPromise = new Promise((resolve, reject) => {
        let completedTweens = 0;

        this.currentTweenGroup = currentGroupConstructors.map(
          (tweenConstructor, index) => {
            const tween = new Konva.Tween(tweenConstructor);

            tween.onReset = () => {
              if (tweenConstructor.onReset) {
                tweenConstructor.onReset();
              }
              completedTweens++;
              if (completedTweens === currentGroupConstructors.length) {
                resolve("reset");
              }
            };

            tween.onFinish = () => {
              if (tweenConstructor.onFinish) {
                tweenConstructor.onFinish();
              }
              completedTweens++;
              if (completedTweens === currentGroupConstructors.length) {
                resolve("finished");
              }
            };

            tween.play();

            return tween;
          },
        );
      });

      const value = await tweenPromise;

      this.currentTweenGroup.forEach((tween) => tween.destroy());
      this.currentTweenGroup = [];

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
