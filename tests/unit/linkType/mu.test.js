import { describe, vi, it, expect } from 'vitest';
import { createMockAPI } from '../apiMock.js';

vi.mock("@wareraprojects/api", () => ({
  createAPIClient: createMockAPI
}));

import getMuData from '#linkType/mu.js';
import muId from '#tests/testData/mu.json' with { type: 'json' }
import muMock from '#tests/mockData/mu.json' with { type: 'json' }

describe("getMuData", () => {
  it.each(muId)(
    "formats mu %s correctly",
    async (id) => {
      const result = await getMuData({id});
      const ranking = result.embed.data.fields[1].value.split("\n");

      expect(ranking.length).toBeGreaterThan(0);
      expect(ranking.length).toBeLessThan(26);

      expect(result).toBeDefined();
      expect(result.embed.data.title).toBe(muMock[id].name);
      expect(result.embed.data.title).toBe(muMock[id].name);
    }

  )

})

