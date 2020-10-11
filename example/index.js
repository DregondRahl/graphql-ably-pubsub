import {pubsub} from "./pubsub"

const { ApolloServer, gql } = require("apollo-server");

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
          return ["random"]
      }
          
  },
  Mutation: {
      addPost(root, args, context) {
      pubsub.publish(POST_ADDED, { postAdded: args });
    },
      addUser(root, args, context) {
      pubsub.publish(USER_ADDED, { userAdded: args });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
