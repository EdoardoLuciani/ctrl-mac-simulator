export class GridAllocator {
  constructor(x, y, elemPhysicalSize, maxElemsPerRow, maxElems) {
    this.allocationsSlotsStatus = new Uint8Array(Number(maxElems));
    this.handleToIdx = new Map();

    this.elemPhysicalSize = elemPhysicalSize;
    this.maxElemsPerRow = maxElemsPerRow;
    this.x = x;
    this.y = y;
  }

  allocate(handle) {
    const index = this.allocationsSlotsStatus.findIndex(
      (element) => element === 0,
    );
    if (index === -1) {
      console.error("Allocator is full");
      return null;
    }

    this.allocationsSlotsStatus[index] = 1;
    this.handleToIdx.set(handle, index);
    return this.#getXYPosFromIndex(index);
  }

  free(handle) {
    const index = this.handleToIdx.get(handle);
    if (index === undefined) {
      return null;
    }

    this.allocationsSlotsStatus[index] = 0;
    this.handleToIdx.delete(handle);
  }

  #getXYPosFromIndex(index) {
    return {
      x: this.x + (index % this.maxElemsPerRow) * this.elemPhysicalSize,
      y:
        this.y +
        Math.floor(index / this.maxElemsPerRow) * this.elemPhysicalSize,
    };
  }
}
