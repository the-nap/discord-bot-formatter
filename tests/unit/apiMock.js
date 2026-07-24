import users from "../mockData/user.json" with { type: 'json' };
import battles from "../mockData/battle.json" with { type: 'json' };
import companies from "../mockData/company.json" with { type: 'json' };
import mus from "../mockData/mu.json" with { type: 'json' };
import regions from "../mockData/region.json" with { type: 'json' };
import articles from "../mockData/article.json" with { type: 'json' };
import { vi } from 'vitest';

export function createMockAPI(){
  return {
    user: {
      getUserLite: vi.fn(async ({ userId }) =>
        getMockUser(userId)
      ),
      getUserById: vi.fn(async ({ userId }) =>
        getMockUser(userId)
      )
    },

    battle: {
      getById: vi.fn(async ({ battleId }) =>
        battles[battleId]
      )
    },

    article: {
      getArticleById: vi.fn(async ({ articleId }) =>
        articles[articleId]
      )
    },

    company: {
      getById: vi.fn(async ({ companyId }) =>
        companies[companyId]
      )
    },

    mu: {
      getById: vi.fn(async ({ muId }) =>
        mus[muId]
      )
    },

    region: {
      getById: vi.fn(async ({ regionId }) =>
        regions[regionId]
      )
    }
  }
}

function getMockUser(userId) {
  return users[userId] ?? {
    _id: userId,
    username: 'MockedUsername',
    avatarUrl: 'https://test.com/'
  };
}
