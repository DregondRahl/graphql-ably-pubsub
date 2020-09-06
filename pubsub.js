import { AblyPubSub } from "./dist";

const options = {
  key: "JAofug.wynVXg:YU-Tf_OcO7Jz_UIK",
};

export const pubsub = new AblyPubSub(options, "h");

// const payload = {
//   commentAdded: {
//     id: "1",
//     content: "Hello!",
//   },
// };

// pubsub.publish("commentAdded", payload);
