export class TweenTimeTraveler {
  constructor(queueEndCallback = null) {
    this.queueEndCallback = queueEndCallback;
    this.#resetState();
  }

  #resetState() {
    this.tweenGroups = [];
    this.groupsCallback = [];
    this.activeTweenGroup = [];
    this.currentGroupIndex = -1;
    this.isPlaying = false;
  }

  queueTweenGroup(tweensBatch, groupCallback = null) {
    if (!Array.isArray(tweensBatch)) {
      console.error("tweensBatch must be an array");
      return this;
    }

    this.tweenGroups.push(tweensBatch);
    this.groupsCallback.push(groupCallback);
    return this;
  }

  #manageTweens(action) {
    if (this.activeTweenGroup.length) {
      this.activeTweenGroup.forEach((tween) => tween[action]());
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
    this.goToGroup(this.currentGroupIndex - 1);
  }

  goToNextGroup() {
    this.goToGroup(this.currentGroupIndex + 1);
  }

  goToGroup(groupIndex) {
    if (groupIndex >= 0 && groupIndex < this.tweenGroups.length) {
      this.currentGroupIndex = groupIndex - 1;
      this.#manageTweens("finish");
      this.playQueue();
    }
  }

  clearQueue() {
    this.#manageTweens("destroy");
    this.#resetState();
  }

  async #playGroups() {
    this.isPlaying = true;

    while (this.currentGroupIndex < this.tweenGroups.length - 1) {
      this.currentGroupIndex++;

      const callback = this.groupsCallback[this.currentGroupIndex];
      if (callback) callback();

      const currentGroup = this.tweenGroups[this.currentGroupIndex];

      const tweenPromise = new Promise((resolve, reject) => {
        let completedTweens = 0;

        this.activeTweenGroup = currentGroup.map((tweenConstructor, index) => {
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

        if (this.activeTweenGroup.length === 0) {
          resolve();
        }
      });

      await tweenPromise;

      this.#manageTweens("destroy");
      this.activeTweenGroup = [];
    }

    this.currentGroupIndex = -1;
    this.isPlaying = false;
    if (this.queueEndCallback) this.queueEndCallback();
  }
}
