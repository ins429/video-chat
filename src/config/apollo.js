import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { hasSubscription } from "@jumpn/utils-graphql";
import { createAbsintheSocketLink } from "@absinthe/socket-apollo-link";
import { onError } from "@apollo/client/link/error";
import absintheSocket from "./absintheSocket";
import { isDevelopment } from "../utils";

const cache = new InMemoryCache({
  dataIdFromObject: (object) => object.id,
});

const errorLink = onError(
  ({ graphQLErrors, networkError, forward, ...rest }) => {
    if (graphQLErrors) {
      isDevelopment() &&
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            "[GraphQL error]: Message:",
            message,
            "Location:",
            locations,
            "Path:",
            path
          )
        );
    }

    if (networkError) {
      if (networkError.statusCode === 401) {
        localStorage.removeItem("token");
        window.location.reload();
      }
      console.log("[Network error]", networkError);
    }
  }
);

const parseBatchResult = new ApolloLink((operation, forward) =>
  forward(operation).map(({ payload, ...rest }) => ({
    ...payload,
    ...rest,
  }))
);

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = ApolloLink.split(
  (operation) => hasSubscription(operation.query),
  createAbsintheSocketLink(absintheSocket),
  new BatchHttpLink({
    uri: process.env.REACT_APP_GRAPHQL_URI,
  })
);

export const client = new ApolloClient({
  cache,
  link: ApolloLink.from([
    errorLink,
    parseBatchResult,
    authLink.concat(httpLink),
  ]),
});
