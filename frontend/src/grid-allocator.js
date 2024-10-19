export class GridAllocator {
  constructor(x, y, elemSize, maxElemsPerRow, maxElems) {
    this.allocationsSlotsStatus = new Array(Number(maxElems)).fill(null);
    this.handleToIdx = new Map();

    this.elemSize = elemSize;
    this.maxElemsPerRow = maxElemsPerRow;
    this.x = x;
    this.y = y;
  }

  allocate(handle) {
    const index = this.allocationsSlotsStatus.findIndex(
      (element) => element === null,
    );
    if (index === -1) {
      console.error("Allocator is full");
      return null;
    }

    this.allocationsSlotsStatus[index] = true;
    this.handleToIdx.set(handle, index);
    return this.#getXYPosFromIndex(index);
  }

  free(handle) {
    const index = this.handleToIdx.get(handle);
    if (index === undefined) {
      return null;
    }

    this.allocationsSlotsStatus[index] = null;
    this.handleToIdx.delete(handle);
  }

  #getXYPosFromIndex(index) {
    return {
      x: this.x + (index % this.maxElemsPerRow) * this.elemSize,
      y: this.y + Math.floor(index / this.maxElemsPerRow) * this.elemSize,
    };
  }
}
