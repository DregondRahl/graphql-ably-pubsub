import { AblyPubSub } from "graphql-ably-pubsub";

const options = {
  key: "YOUR_ABLY_API_KEY",
};

export const pubsub = new AblyPubSub(options);
