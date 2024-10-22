/**
 * @class GridAllocator
 * @description Manages allocation of grid positions for elements
 */
export class GridAllocator {
  /**
   * @constructor
   * @param {number} x - Starting x-coordinate of the grid
   * @param {number} y - Starting y-coordinate of the grid
   * @param {number} elemPhysicalSize - Size of each element
   * @param {number} maxElemsPerRow - Maximum elements per row
   * @param {number} maxElems - Maximum total elements
   */
  constructor(x, y, elemPhysicalSize, maxElemsPerRow, maxElems) {
    this.allocationsSlotsStatus = new Uint8Array(Number(maxElems));
    this.handleToIdx = new Map();

    this.elemPhysicalSize = elemPhysicalSize;
    this.maxElemsPerRow = maxElemsPerRow;
    this.x = x;
    this.y = y;
  }

  /**
   * @method allocate
   * @param {*} handle - Unique identifier for the element
   * @returns {{x: number, y: number}|null} Position object {x, y} or null if allocation fails
   */
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

  /**
   * @method free
   * @param {*} handle - Unique identifier of the element to free
   */
  free(handle) {
    const index = this.handleToIdx.get(handle);
    if (index === undefined) {
      return;
    }

    this.allocationsSlotsStatus[index] = 0;
    this.handleToIdx.delete(handle);
  }

  /**
   * @private
   * @method #getXYPosFromIndex
   * @param {number} index - Index in the allocation array
   * @returns {{x: number, y: number}} Position object {x, y}
   */
  #getXYPosFromIndex(index) {
    return {
      x: this.x + (index % this.maxElemsPerRow) * this.elemPhysicalSize,
      y:
        this.y +
        Math.floor(index / this.maxElemsPerRow) * this.elemPhysicalSize,
    };
  }
}
