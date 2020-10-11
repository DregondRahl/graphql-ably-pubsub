# Running the example

This example shows the usage of this library with a basic GraphQL schema.

- First build the library locally by running `npm i && npm run compile` from the root folder of this repo, which will generate the dist folder to which this example points to.
- Add your Ably API key in the `pubsub.js` file.
- Install the dependencies `npm i` and start the server `node -r esm index.js`.
- Open GraphQL playground with `http://localhost:4000/graphql`. 
- Use one tab to have subscription query like this, which will show the new posts as soon they're added(post add mutation) -
    ```graphql
    subscription {
    postAdded {
        comment
        author
    }
    }
    ```
- In another tab have a mutation to add a post, when this is executed you can see that the other tab (subscription query) shows the new post immediately -
    ```graphql
    mutation {
    addPost(author: "Apoorv", comment: "test") {
        author
    }
    }
    ```
