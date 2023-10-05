import useTrackSubscription from "./useTrackSubscription";
import useTrackAudio from "./useTrackAudio";
import useTrackVideo from "./useTrackVideo";

export default function useTrack({ participant, room }) {
  const { audioTrack, videoTrack } = useTrackSubscription({ participant });
  const { audioOn } = useTrackAudio({ audioTrack });
  const { videoOn } = useTrackVideo({ videoTrack, room });

  return {
    audioTrack,
    videoTrack,
    audioOn,
    videoOn,
  };
}
