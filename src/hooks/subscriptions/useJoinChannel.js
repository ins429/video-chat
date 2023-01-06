import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

export const JOIN_CHANNEL = gql`
  mutation JoinChannel($channelName: String!) {
    joinChannel(channelName: $channelName) {
      id
      name
      messages {
        id
        message
      }
      users {
        id
      }
    }
  }
`;

const useJoinChannelMutation = (options) => {
  const [mutate, result] = useMutation(JOIN_CHANNEL, options);

  const joinChannel = (channelName) =>
    mutate({
      variables: {
        channelName,
      },
    });

  return [joinChannel, result];
};

export default useJoinChannelMutation;
