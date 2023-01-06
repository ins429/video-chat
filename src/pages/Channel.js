import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useJoinChatChannelMutation from "hooks/mutations/useJoinChannel";
import Video from "../components/Video";

const Channel = () => {
  const { channelName } = useParams();
  const [
    joinChatChannel,
    {
      data: joinChatChannelData,
      loading: joinChatChannelLoading,
      error: joinChatChannelError,
    },
  ] = useJoinChatChannelMutation();

  useEffect(() => {
    joinChatChannel(channelName);
  }, [joinChatChannel]);

  useEffect(() => {
    console.log("joinChatChannelData", joinChatChannelData);
  }, [joinChatChannelData]);

  return (
    <div>
      channel page
      {joinChatChannelLoading ? (
        "Loading..."
      ) : (
        <Video channel={joinChatChannelData?.joinChatChannel} />
      )}
    </div>
  );
};

export default Channel;
