import { gql, useSubscription } from "@apollo/client";

export const USER_UPDATED = gql`
  subscription UserUpdatedSubscription($userId: String!) {
    userUpdated(userId: $userId) {
      id
      name
      email
      appIds
      memberAppIds
      createdAt
    }
  }
`;

const useUserUpdatedSubscription = (userId) =>
  useSubscription(USER_UPDATED, {
    variables: { userId },
  });

export default useUserUpdatedSubscription;
