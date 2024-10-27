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

  #manageTweens(action) {
    if (this.currentTweenGroup.length) {
      this.currentTweenGroup.forEach((tween) => tween[action]());
    }
  }

  playQueue() {
    if (this.isPlaying) {
      this.#manageTweens("play");
      return;
    }
    this.#playNextGroup();
  }

  pauseQueue() {
    this.#manageTweens("pause");
  }

  rollbackToPreviousGroup() {
    if (this.currentGroupIndex > 0) {
      this.#manageTweens("reset");
    }
  }

  fastForwardToNextGroup() {
    if (this.currentGroupIndex < this.stepsGroups.length - 1) {
      this.#manageTweens("finish");
    }
  }

  clearQueue() {
    this.#manageTweens("destroy");
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

        this.currentTweenGroup = currentGroup.map((tweenConstructor, index) => {
          if (tweenConstructor.onStart) tweenConstructor.onStart();

          const tween = new Konva.Tween(tweenConstructor);

          tween.onReset = () => {
            if (tweenConstructor.onReset) tweenConstructor.onReset();

            completedTweens++;
            if (completedTweens === currentGroup.length) {
              resolve("reset");
            }
          };

          tween.onFinish = () => {
            if (tweenConstructor.onFinish) tweenConstructor.onFinish();

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

      this.#manageTweens("destroy");
      this.currentTweenGroup = [];

      const callback = this.groupCallbacks[this.currentGroupIndex];
      if (callback) callback();

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
