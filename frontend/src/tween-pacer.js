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
    this.#playGroups();
  }

  pauseQueue() {
    this.#manageTweens("pause");
  }

  gotoPreviousGroup() {
    this.goToGroup(this.currentGroupIndex - 1);
  }

  goToNextGroup() {
    this.goToGroup(this.currentGroupIndex + 1);
  }

  goToGroup(groupIndex) {
    if (groupIndex >= 0 && groupIndex < this.stepsGroups.length) {
      this.currentGroupIndex = groupIndex - 1;
      this.#manageTweens("finish");
    }
  }

  clearQueue() {
    this.#manageTweens("destroy");
    this.stepsGroups = [];
    this.currentGroupIndex = 0;
    this.isPlaying = false;
  }

  async #playGroups() {
    this.isPlaying = true;
    this.currentGroupIndex = 0;

    while (this.currentGroupIndex < this.stepsGroups.length) {
      const currentGroup = this.stepsGroups[this.currentGroupIndex];

      const tweenPromise = new Promise((resolve, reject) => {
        let completedTweens = 0;

        this.currentTweenGroup = currentGroup.map((tweenConstructor, index) => {
          if (tweenConstructor.onStart) tweenConstructor.onStart();

          const tween = new Konva.Tween(tweenConstructor);

          tween.onFinish = () => {
            if (tweenConstructor.onFinish) tweenConstructor.onFinish();

            completedTweens++;
            if (completedTweens === currentGroup.length) {
              resolve();
            }
          };

          tween.play();

          return tween;
        });
      });

      await tweenPromise;

      this.#manageTweens("destroy");
      this.currentTweenGroup = [];

      const callback = this.groupCallbacks[this.currentGroupIndex];
      if (callback) callback();

      this.currentGroupIndex++;
    }

    this.isPlaying = false;
  }
}
