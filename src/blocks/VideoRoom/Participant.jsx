import React from "react";
import useTrack from "./utils/useTrack";
import VideoTrack from "./VideoTrack";
import AudioTrack from "./AudioTrack";
import { Icon, Loading } from "@USupport-components-library/src";

export default function Participant({
  type,
  participant,
  room,
  deniedPermissions,
}) {
  const { videoOn, audioOn, videoTrack, audioTrack } = useTrack({
    participant,
    room,
  });

  return (
    <React.Fragment>
      {videoOn ? (
        <VideoTrack type={type} track={videoTrack} />
      ) : (
        <div className={`${type}-video-off video-off`}>
          {participant || deniedPermissions ? (
            <Icon name="stop-camera" size="lg" color="#ffffff" />
          ) : (
            <Loading padding="0" size="md" />
          )}
        </div>
      )}
      {audioOn ? <AudioTrack track={audioTrack} /> : null}
    </React.Fragment>
  );
}
