import React from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "./config/apollo";
import Router from "./Router";
import { CurrentUserProvider } from "./components/CurrentUserContext";
import "./App.css";

const App = () => {
  return (
    <ApolloProvider client={client}>
      <CurrentUserProvider>
        {false && (
          <div style={{ fontSize: 300 }}>
            🂡 <span style={{ color: "red" }}>🂱</span>
          </div>
        )}
        <Router />
      </CurrentUserProvider>
    </ApolloProvider>
  );
};

export default App;
