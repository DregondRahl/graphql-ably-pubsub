import {pubsub} from "./pubsub"
// import { createServer } from "http";
// import { SubscriptionServer } from "subscriptions-transport-ws";
// import { execute, subscribe } from "graphql";
// import {buildSchema} from "./schema";

// const WS_PORT = 5000;

// // Create WebSocket listener server
// const websocketServer = createServer((request, response) => {
//   response.writeHead(404);
//   response.end();
// });

// // Bind it to port and start listening
// websocketServer.listen(WS_PORT, () =>
//   console.log(`Websocket Server is now running on http://localhost:${WS_PORT}`)
// );

// const subscriptionServer = SubscriptionServer.create(
//   {
//     schema: buildSchema(),
//     execute,
//     subscribe,
//   },
//   {
//     server: websocketServer,
//     path: "/graphql",
//   }
// );

const { ApolloServer, gql } = require("apollo-server");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type Subscription {
    postAdded: Post
    userAdded: User
  }

  type Query {
    posts: [Post]
  }

  type Mutation {
    addPost(author: String, comment: String): Post
    addUser(name: String): User
  }

  type Post {
    author: String
    comment: String
  }

  type User {
      name: String
  }
`;

const books = [
  {
    comment: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
  },
  {
    comment: "Jurassic Park",
    author: "Michael Crichton",
  },
];

const POST_ADDED = "POST_ADDED";
const USER_ADDED = "USER_ADDED";

const resolvers = {
  Subscription: {
    postAdded: {
      // Additional event labels can be passed to asyncIterator creation
          subscribe: () => pubsub.asyncIterator(POST_ADDED)  
    },
    userAdded: {
      // Additional event labels can be passed to asyncIterator creation
          subscribe: () => pubsub.asyncIterator(USER_ADDED)  
    },
  },
  Query: {
      posts: () => {
          return ["saddas"]
      }
          
  },
  Mutation: {
      addPost(root, args, context) {
      pubsub.publish(POST_ADDED, { postAdded: args });
      // return postController.addPost(args);
    },
      addUser(root, args, context) {
      pubsub.publish(USER_ADDED, { userAdded: args });
      // return postController.addPost(args);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
