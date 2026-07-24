import { describe, vi, it, expect } from 'vitest';
import { createMockAPI } from '../apiMock.js';

vi.mock("@wareraprojects/api", () => ({
  createAPIClient: createMockAPI
}));

vi.mock("#utils/renderBattleMap.js", () => ({
  renderBattleMap: vi.fn(() => "<svg></svg>")
}));

vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    png: () => ({
      toBuffer: async () => Buffer.from("fake-png")
    })
  }))
}));


import getRegionData from '#linkType/region.js';
import regionId from '#tests/testData/region.json' with { type: 'json' }
import regionMock from '#tests/mockData/region.json' with { type: 'json' }

describe("getRegionData", () => {
  it.each(regionId)(
    "formats regions %s correctly",
    async (id) => {
      const result = await getRegionData({ id });

      expect(result).toBeDefined();
      expect(result.embed.data.title).toBe(regionMock[id].name);
      expect(result.file).toBeDefined();
      expect(result.file.name).toBe('region.png');
    }
  )}
)
