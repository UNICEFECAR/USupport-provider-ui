import { useEffect, useRef } from "react";
import io from "socket.io-client";

const SOCKET_IO_URL = `${import.meta.env.VITE_SOCKET_IO_URL}`;

export const useConsultationSocket = ({
  chatId,
  receiveMessage,
  isClientTyping,
  setInterfaceData,
}) => {
  const language = localStorage.getItem("language");
  const country = localStorage.getItem("country");

  const socketRef = useRef();
  useEffect(() => {
    socketRef.current = io(SOCKET_IO_URL, {
      path: "/api/v1/ws/socket.io",
      transports: ["websocket"],
      secure: false,
    });
    socketRef.current.emit("join chat", {
      country,
      language,
      chatId,
      userType: "provider",
    });

    socketRef.current.on("receive message", receiveMessage);

    socketRef.current.on("typing", (type) => {
      const isTyping = !isClientTyping && type === "typing";
      setInterfaceData((prev) => ({ ...prev, isClientTyping: isTyping }));
    });

    const systemMessage = {
      type: "system",
      content: "provider_joined",
      time: JSON.stringify(new Date().getTime()),
    };

    const emitJoinMessageTimeout = setTimeout(() => {
      socketRef.current.emit("send message", {
        language,
        country,
        chatId,
        to: "client",
        message: systemMessage,
      });
    }, 1500);

    const handleBeforeUnload = () => {
      // leaveConsultation();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off();
        clearTimeout(emitJoinMessageTimeout);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return socketRef;
};
