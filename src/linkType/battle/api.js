import { createAPIClient } from "@wareraprojects/api"

export async function fetchName(id, endpointType){
  const client = createAPIClient();

  switch (endpointType) {
    case 'mu':
      return (await client.mu.getById({ muId:id })).name;
    case 'user':
      return (await client.user.getUserLite({ userId:id })).username;
    default:
      return null;
  }

}
