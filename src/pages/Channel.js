import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useJoinChatChannelMutation from "hooks/mutations/useJoinChannel";
import Video from "../components/Video";
import { PageLoader } from "../components/Loader";

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

  useEffect(() => {}, [joinChatChannelData]);
  React.useEffect(() => {
    console.log("pjlee xxxx");
  }, []);

  if (joinChatChannelLoading || !joinChatChannelData) {
    return <PageLoader text />;
  }
  console.log("pjlee yyyy");

  return (
    <div>
      channel page
      <Video channel={joinChatChannelData?.joinChatChannel} />
    </div>
  );
};

export default Channel;
