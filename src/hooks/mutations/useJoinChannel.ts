import { useCallback } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/client";

export const JOIN_CHANNEL = gql`
  mutation JoinChatChannel($channelName: String!) {
    joinChatChannel(channelName: $channelName) {
      id
      name
      users {
        id
      }
    }
  }
`;

const useJoinChannelMutation = () => {
  const [mutate, result] = useMutation(JOIN_CHANNEL);

  const joinChannel = useCallback(
    (channelName: string) =>
      mutate({
        variables: {
          channelName,
        },
      }),
    [mutate]
  );

  return [joinChannel, result];
};

export default useJoinChannelMutation;
