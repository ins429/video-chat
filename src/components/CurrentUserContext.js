import React, { createContext } from "react";
import { gql, useQuery } from "@apollo/client";
import useUserUpdatedSubscription from "../hooks/subscriptions/useUserUpdated";

const CurrentUserContext = createContext();

export let token = "";

const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    user {
      id
      name
      email
      acsId
      communicationAccessToken
      createdAt
    }
  }
`;

const SESSION_TOKEN_QUERY = gql`
  query SessionToken {
    sessionToken
  }
`;

const UserUpdatedSubscription = ({ userId }) => {
  useUserUpdatedSubscription(userId);
  return null;
};

export const CurrentUserProvider = ({ children }) => {
  const { loading: loadingSessionToken } = useQuery(SESSION_TOKEN_QUERY, {
    onCompleted: ({ sessionToken }) => {
      if (localStorage) {
        localStorage.setItem("token", sessionToken);
      } else {
        token = sessionToken;
      }
    },
  });

  const {
    data: { user: currentUser } = {},
    loading,
    refetch,
  } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: "network-only",
    skip: loadingSessionToken,
  });

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        refetch,
        loading: loading || loadingSessionToken,
      }}
    >
      {currentUser?.id && <UserUpdatedSubscription userId={currentUser.id} />}
      {children}
    </CurrentUserContext.Provider>
  );
};

export default CurrentUserContext;
