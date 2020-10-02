# Running the example

- First build the library locally by running `npm run compile` from the root folder, that will generate the dist folder to which this example points to.
- Add your Ably API key in the `index.js` file.
- Install the dependencies `npm i` and start the server `node -r esm index.js`.
- Open GraphQL playground with `http://localhost:4000/graphql`. 
- Use one tab to have subscription query like this -
    ```graphql
    subscription {
    postAdded {
        comment
        author
    }
    }
    ```
- In another tab have a mutation to add a post -
    ```graphql
    mutation {
    addPost(author: "Apoorv", comment: "test") {
        author
    }
    }
    ```
