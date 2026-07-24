import { createAPIClient } from "@wareraprojects/api";

const client = createAPIClient();

export async function fetchMu(muId) {
  return client.mu.getById({ muId: muId });
}

export async function fetchActiveMembers(mu) {
  const users = await Promise.all(
    mu.members.map(userId =>
      client.user.getUserLite({ userId: userId })
    )
  );

  return users.filter(user => user.isActive);
}
