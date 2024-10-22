import { GridAllocator } from "./src/grid-allocator";
import { expect, test, beforeEach, describe } from "vitest";

describe("GridAllocator", () => {
  let allocator;

  beforeEach(() => {
    allocator = new GridAllocator(10, 20, 30, 5, 20);
  });

  test("constructor initializes correctly", () => {
    expect(allocator.allocationsSlotsStatus).toHaveLength(20);
    expect(allocator.allocationsSlotsStatus.every((slot) => slot === 0)).toBe(
      true,
    );
    expect(allocator.handleToIdx.size).toBe(0);
    expect(allocator.elemPhysicalSize).toBe(30);
    expect(allocator.maxElemsPerRow).toBe(5);
    expect(allocator.x).toBe(10);
    expect(allocator.y).toBe(20);
  });

  test("allocate returns correct position for first element", () => {
    const result = allocator.allocate("handle1");
    expect(result).toEqual({ x: 10, y: 20 });
  });

  test("allocate returns correct position for second element", () => {
    allocator.allocate("handle1");
    const result = allocator.allocate("handle2");
    expect(result).toEqual({ x: 40, y: 20 });
  });

  test("allocate returns correct position for element in second row", () => {
    for (let i = 0; i < 5; i++) {
      allocator.allocate(`handle${i}`);
    }
    const result = allocator.allocate("handle5");
    expect(result).toEqual({ x: 10, y: 50 });
  });

  test("allocate returns null when full", () => {
    for (let i = 0; i < 20; i++) {
      allocator.allocate(`handle${i}`);
    }
    const result = allocator.allocate("handleExtra");
    expect(result).toBeNull();
  });

  test("free removes allocation correctly", () => {
    allocator.allocate("handle1");
    allocator.free("handle1");
    expect(allocator.allocationsSlotsStatus[0]).toBeFalsy();
    expect(allocator.handleToIdx.has("handle1")).toBe(false);
  });

  test("free does nothing for non-existent handle", () => {
    const result = allocator.free("nonExistentHandle");
    expect(result).toBeUndefined();
  });

  test("allocate reuses freed slot", () => {
    allocator.allocate("handle1");
    allocator.free("handle1");
    const result = allocator.allocate("handle2");
    expect(result).toEqual({ x: 10, y: 20 });
  });

  test("multiple allocations and frees work correctly", () => {
    allocator.allocate("handle1");
    allocator.allocate("handle2");
    allocator.free("handle1");
    const result1 = allocator.allocate("handle3");
    expect(result1).toEqual({ x: 10, y: 20 });

    allocator.free("handle2");
    const result2 = allocator.allocate("handle4");
    expect(result2).toEqual({ x: 40, y: 20 });
  });
});
