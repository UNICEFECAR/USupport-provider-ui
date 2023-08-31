import { useEffect, useState } from "react";

export default function useTrackVideo({ videoTrack, room }) {
  const [videoOn, setVideoOn] = useState(false);

  useEffect(() => {
    if (videoTrack) {
      // initial state video
      setVideoOn(videoTrack.isEnabled);

      const handleVideoDisabled = () => {
        setVideoOn(false);
      };

      const handleVideoEnabled = () => {
        setVideoOn(true);
      };

      videoTrack.on("disabled", handleVideoDisabled);
      videoTrack.on("enabled", handleVideoEnabled);

      return () => {
        videoTrack.off("disabled", handleVideoDisabled);
        videoTrack.off("enabled", handleVideoEnabled);
      };
    } else {
      setVideoOn(false);
    }
  }, [videoTrack]);

  useEffect(() => {
    if (room) {
      room.on("trackMessage", (message) => {
        // This message is sent from the mobile application when the app is minimized in order to hide
        // the remote video, because it freezes untill the app is brought back in active state
        if (message === "videoOff") {
          setVideoOn(false);
        } else if (message === "videoOn") {
          setVideoOn(true);
        }
      });
    }
  }, [room]);

  return { videoOn };
}
