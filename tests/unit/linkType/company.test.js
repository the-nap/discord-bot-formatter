import { describe, vi, it, expect } from 'vitest';
import { createMockAPI } from '../apiMock.js';

vi.mock("@wareraprojects/api", () => ({
  createAPIClient: createMockAPI
}));

import getCompanyData from '#linkType/company.js';
import companyIds from '#tests/testData/company.json' with { type: 'json' }
import companyMock from '#tests/mockData/company.json' with { type: 'json' }

describe("getCompanyData", () => {
  it.each(companyIds)(
    "formats company %s correctly",
    async (id) => {
      const result = await getCompanyData({id});
      
      expect(result.embed).toBeDefined();
      expect(result.embed.data.title).toBe(companyMock[id].name);
      expect(result.embed.data.fields.every(
        field => field.value
      )).toBeDefined();
      expect(result.embed.data.thumbnail).toBeDefined();
    }
  )
})
