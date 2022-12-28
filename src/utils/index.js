export const isDevelopment = () =>
  process.env.REACT_APP_ENVIRONMENT === "development";

export const graphQLError = (message) => `GraphQL error: ${message}`;
