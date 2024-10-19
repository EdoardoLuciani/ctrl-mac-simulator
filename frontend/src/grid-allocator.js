export class GridAllocator {
  constructor(x, y, elemSize, maxElemsPerRow, maxElems) {
    this.allocations = new Array(Number(maxElems)).fill(null);

    this.elemSize = elemSize;
    this.maxElemsPerRow = maxElemsPerRow;
    this.x = x;
    this.y = y;
  }

  allocate(handle) {
    const index = this.allocations.findIndex((element) => element === null);
    if (index === -1) {
      console.error("Allocator is full");
      return null;
    }

    this.allocations[index] = handle;
    return this.#getXYPosFromIndex(index);
  }

  free(handle) {
    const index = this.allocations.findIndex((element) => element === handle);
    if (index === -1) {
      return null;
    }
    this.allocations[index] = null;
  }

  #getXYPosFromIndex(index) {
    return {
      x: this.x + (index % this.maxElemsPerRow) * this.elemSize,
      y: this.y + Math.floor(index / this.maxElemsPerRow) * this.elemSize,
    };
  }
}
