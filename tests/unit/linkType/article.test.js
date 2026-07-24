import { describe, vi, it, expect } from 'vitest';
import { createMockAPI } from '../apiMock.js';

vi.mock("@wareraprojects/api", () => ({
  createAPIClient: createMockAPI
}));

import getArticleData from '#linkType/article.js';
import articleIds from '#tests/testData/article.json' with { type: 'json' }
import articleMock from '#tests/mockData/article.json' with { type: 'json' }

describe("getArticleData", () => {
  it.each(articleIds)(
    "formats article %s correctly",
    async (id) => {
      const result = await getArticleData({id});
      
      expect(result.embed).toBeDefined();
      expect(result.embed.data.title).toBe(articleMock[id].title);
      expect(result.embed.data.author).toBeDefined();
      expect(result.embed.data.thumbnail).toBeDefined();
    }
  )
})
