import { describe, it, vi, expect } from "vitest";

vi.mock("../../../util/mapLoader.js", () => ({
  loadMapAndBounds: vi.fn( async () => ({
    map: '<path d="WORLD"/>',
    regions: {
      1: 'A',
      2: 'B',
    },
    bounds: {
      1: [[0, 0], [100, 100]],
      1: [[200, 0], [300, 100]],
    },
  })),
}));

const { renderBattleMap } = await import('../../../util/renderBattleMap.js');

describe('renderBattleMap', () => {
  it('returns an svg', () => {
    const svg = renderBattleMap([1]);

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  })

  it('paints the first region red', () => {
    const svg = renderBattleMap([1]);

    expect(svg).toContain('<path d="A" fill="#ef4444" />');
  })

  it('paints the second region red', () => {
    const svg = renderBattleMap([1, 2]);

    expect(svg).toContain('<path d="B" fill="#22c55e" />');
  })

  it('does not paint a second region if absent', () => {
    const svg = renderBattleMap([1]);

    expect(svg).not.toContain("22c55e");
  })

  it('includes the base map', () => {
    const svg = renderBattleMap([1]);

    expect(svg).toContain('<path d="WORLD"/>');
  })
  
  it("adds a transform", () => {
    const svg = renderBattleMap([1]);

    expect(svg).toMatch(/transform="translate\(/);
});
})
