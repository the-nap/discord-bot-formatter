import { describe, expect, it } from "vitest";
import computeFocusTransform from "../../../util/focusTransform";

const [ WIDTH, HEIGHT ] = [500, 300];

describe("computeFocusTransform", () => {
  it("computes the center of one region", () => {
    const bounds = {
      1: [[0, 0], [100, 100]],
    }

    const result = computeFocusTransform(bounds, [1], WIDTH, HEIGHT)

    expect(result.cx).toEqual(50);
    expect(result.cy).toEqual(50);
    expect(result.zoom).toBeCloseTo(2.68);

  });


  it("computes the center of 2 regions", () => {
    const bounds = {
      1: [[0, 0], [100, 100]],
      2: [[200, 0], [300, 100]]
    }

    const result = computeFocusTransform(bounds, [1, 2], WIDTH, HEIGHT)

    expect(result.cx).toEqual(150);
    expect(result.cy).toEqual(50);
    expect(result.zoom).toBeCloseTo(1.56);
  });

  it("ignores missing regions", () => {
    const bounds = {
      1: [[0, 0], [100, 100]],
    }

    const result = computeFocusTransform(bounds, [1, 999], WIDTH, HEIGHT)

    expect(result.cx).toEqual(50);
    expect(result.cy).toEqual(50);
    expect(result.zoom).toBeCloseTo(2.68);
  });

  it("does not zoom below minimum", () => {
    const bounds = {
      1: [[0, 0], [1000, 1000]],
    };
    
    const result = computeFocusTransform(bounds, [1], WIDTH, HEIGHT);

    expect(result.zoom).toBe(1.5);
  })

  it("does not zoom above maximum", () => {
    const bounds = {
      1: [[0, 0], [10, 10]],
    };
    
    const result = computeFocusTransform(bounds, [1], WIDTH, HEIGHT);

    expect(result.zoom).toBe(18);
  })

  it("returns null for no regions", () => {

    expect(computeFocusTransform({},[], WIDTH, HEIGHT))
      .toBeNull();
  })
})
