import { createAPIClient } from "@wareraprojects/api";

const client = createAPIClient();

export async function renameDamageMap(damageMap) {
    const users = await Promise.all(
        [...damageMap.keys()].map(userId =>
            client.user.getUserLite({ userId })
        )
    );

    return new Map(
        users.map(user => [
            user.username,
            damageMap.get(user._id)
        ])
    );
}
