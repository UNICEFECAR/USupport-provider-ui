import { useCallback, useEffect, useState } from "react";
import { connect } from "twilio-video";

const INITIAL_STATE = {
  room: null,
  error: null,
};

export default function useRoomConnection(setIsClientInSession) {
  const [roomState, setRoomState] = useState(INITIAL_STATE);
  const { room } = roomState;

  /**
   * connect to a room
   */
  const connectRoom = useCallback(({ token, options }) => {
    connect(token, options)
      .then((room) => {
        setRoomState((c) => ({ ...c, room }));
      })
      .catch((error) => {
        setRoomState((c) => ({ ...c, error }));
      });
  }, []);

  /**
   * Disconnect from room
   */
  const disconnectRoom = useCallback(() => {
    if (room) {
      room.disconnect();
    }
  }, [room]);

  /**
   * handle on beforeunload & on pagehide
   */
  useEffect(() => {
    if (room) {
      room.on("participantDisconnected", () => {
        setIsClientInSession(false);
        // console.log("client disconnected");
      });
      room.on("participantConnected", () => {
        setIsClientInSession(true);
        // console.log("client connected");
      });

      window.addEventListener("beforeunload", disconnectRoom);
      window.addEventListener("pagehide", disconnectRoom);

      // remove listener
      room.once("disconnected", () => {
        window.removeEventListener("beforeunload", disconnectRoom);
        window.removeEventListener("pagehide", disconnectRoom);
      });

      return () => {
        window.removeEventListener("beforeunload", disconnectRoom);
        window.removeEventListener("pagehide", disconnectRoom);
      };
    }
  }, [disconnectRoom, room]);

  return { ...roomState, disconnectRoom, connectRoom };
}
