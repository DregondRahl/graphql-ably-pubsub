import { AblyPubSub } from "../dist";

const options = {
  key: "YOUR_ABLY_API_KEY",
};

export const pubsub = new AblyPubSub(options);
