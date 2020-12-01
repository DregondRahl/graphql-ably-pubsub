# graphql-ably-pubsub

[Ably](https://www.ably.io/documentation) is a pub/sub messaging platform with a suite of integrated services to deliver complete realtime functionality directly to end-users. In the context of GraphQL, we can use it to publish when a mutation is fired and subscribe to the result through a subscription query.

This package implements the PubSubEngine Interface from the [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions) package and also the new AsyncIterator interface.
It allows you to connect your subscription manger to an Ably PubSub mechanism to support multiple subscription manager instances.

Check out the [example](https://github.com/ably-labs/graphql-ably-pubsub/tree/master/example) folder for basic usage.

## Installation

`npm install graphql-ably-pubsub`
or
`yarn add graphql-ably-pubsub`

## Using as AsyncIterator

Define your GraphQL schema with a `Subscription` type:

```graphql
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Subscription {
  somethingChanged: Result
}

type Result {
  id: String
}
```

Now, let's create a simple `AblyPubSub` instance:

```javascript
import { AblyPubSub } from "graphql-ably-pubsub";
const pubsub = new AblyPubSub();
```

Now, implement your Subscriptions type resolver, using the `pubsub.asyncIterator` to map the event you need:

```javascript
const SOMETHING_CHANGED_TOPIC = "something_changed";

export const resolvers = {
  Subscription: {
    somethingChanged: {
      subscribe: () => pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC),
    },
  },
};
```

> Subscriptions resolvers are not a function, but an object with `subscribe` method, that returns `AsyncIterable`.

Calling the method `asyncIterator` of the `AblyPubSub` instance will subscribe to the topic provided and will return an `AsyncIterator` bound to the AblyPubSub instance and listens to any event published on that topic.
Now, the GraphQL engine knows that `somethingChanged` is a subscription, and every time we will use `pubsub.publish` over this topic, the `AblyPubSub` will `PUBLISH` the event to all other subscribed instances and those in their turn will emit the event to GraphQL using the `next` callback given by the GraphQL engine.

```js
pubsub.publish(SOMETHING_CHANGED_TOPIC, { somethingChanged: { id: "123" } });
```

## Dynamically use a topic based on subscription args passed on the query:

```javascript
export const resolvers = {
  Subscription: {
    somethingChanged: {
      subscribe: (_, args) =>
        pubsub.asyncIterator(`${SOMETHING_CHANGED_TOPIC}.${args.relevantId}`),
    },
  },
};
```

## Using both arguments and payload to filter events

```javascript
import { withFilter } from "graphql-subscriptions";

export const resolvers = {
  Subscription: {
    somethingChanged: {
      subscribe: withFilter(
        (_, args) =>
          pubsub.asyncIterator(`${SOMETHING_CHANGED_TOPIC}.${args.relevantId}`),
        (payload, variables) =>
          payload.somethingChanged.id === variables.relevantId
      ),
    },
  },
};
```

## Creating the Ably Client

```javascript
import { AblyPubSub } from "graphql-ably-pubsub";

const pubSub = new AblyPubSub(options, channelName, pubSubClient);
```

### Options

These are the [options](https://www.ably.io/documentation/realtime/usage#client-options) which are passed to the internal or passed Ably PubSub client.
Example -

```javascript
const options = {
  key: "<YOUR-ABLY-API-KEY>",
};
```

### channelName (optional)

If specified, this channel name is used for every trigger otherwise the trigger itself is used as the channel name.
Example -

```javascript
const channel = "ably-subscription-channel";
```

### pubSubClient (optional)

If specified, then this client will be used and the `options` param value will be ignored.
Example -

```javascript
const options = {
  key: "<YOUR-ABLY-API-KEY>",
};
const pubSubClient = new Ably.Realtime(options);
```

## Acknowledgements

This project is mostly inspired by [graphql-redis-subscriptions](https://github.com/davidyaha/graphql-redis-subscriptions) and [graphql-google-pubsub](https://github.com/axelspringer/graphql-google-pubsub). Thanks to its authors for their work and inspiration.
