import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import io from "socket.io-client";

import {
  SendMessage,
  Message,
  SystemMessage,
  Loading,
  Backdrop,
} from "@USupport-components-library/src";
import { useWindowDimensions } from "@USupport-components-library/utils";

import { useGetChatData, useSendMessage } from "#hooks";
import { Page, VideoRoom } from "#blocks";

import "./consultation.scss";

const SOCKET_IO_URL = `${import.meta.env.VITE_SOCKET_IO_URL}`;

/**
 * Consultation
 *
 * Video - text consultation page
 *
 * @returns {JSX.Element}
 */
export const Consultation = () => {
  const { t } = useTranslation("consultation-page");
  const { width } = useWindowDimensions();
  const navigate = useNavigate();
  const location = useLocation();

  const consultation = location.state?.consultation;
  const joinWithVideo = location.state?.videoOn;
  const token = location.state?.token;

  if (!consultation) return <Navigate to="/consultations" />;

  const [isChatShownOnMobile, setIsChatShownOnMobile] = useState(
    !joinWithVideo
  );

  const [messages, setMessages] = useState([]);

  const onSendSuccess = (data) => {
    setMessages([...data.messages]);
  };
  const onSendError = (err) => {
    toast(err, { type: "error" });
  };
  const sendMessageMutation = useSendMessage(onSendSuccess, onSendError);

  const chatDataQuery = useGetChatData(consultation?.chatId, (data) =>
    setMessages(data.messages)
  );

  const providerId = chatDataQuery.data?.providerDetailId;

  const language = localStorage.getItem("language");
  const country = localStorage.getItem("country");
  const socketRef = useRef();

  // TODO: Send a consultation join request for
  // TODO: Send a system message when the user joins the consultation
  // TODO: Send a leave request when the user leaves the consultation
  // TODO: Send a system message when the user leaves the consultation
  // TODO: Send a consultation add services request only when the provider leaves the consultation
  // TODO: Send a system message when the client/provider toggles camera
  useEffect(() => {
    socketRef.current = io(SOCKET_IO_URL, {
      path: "/api/v1/ws/socket.io",
      transports: ["websocket"],
      secure: false,
    });
    socketRef.current.emit("join chat", {
      country,
      language,
      chatId: consultation.chatId,
      userType: "provider",
    });

    socketRef.current.on("receive message", receiveMessage);
    // window.addEventListener("beforeunload", (ev) => {
    //   console.log("asd");
    //   return (ev.returnValue = "Are you sure you want to close?");
    // });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const receiveMessage = (message) => {
    setMessages((messages) => [...messages, message]);
  };

  const renderAllMessages = () => {
    if (chatDataQuery.isLoading) return <Loading size="lg" />;
    return messages.map((message) => {
      if (message.type === "system-message") {
        return (
          <SystemMessage
            key={message.time}
            title={message.content}
            date={new Date(message.time)}
          />
        );
      } else {
        if (message.senderId === providerId) {
          return (
            <Message
              key={message.time}
              message={message.content}
              sent
              date={new Date(message.time)}
            />
          );
        } else {
          return (
            <Message
              key={message.time}
              message={message.content}
              received
              date={new Date(message.time)}
            />
          );
        }
      }
    });
  };

  const handleSendMessage = (content) => {
    const message = {
      content,
      type: "text",
      time: JSON.stringify(new Date().getTime()),
    };
    sendMessageMutation.mutate({
      message,
      chatId: consultation.chatId,
    });

    socketRef.current.emit("send message", {
      language,
      country,
      chatId: consultation.chatId,
      to: "client",
      message,
    });
  };

  const showChat = width < 768;

  const toggleChat = () => setIsChatShownOnMobile(!isChatShownOnMobile);

  const leaveConsultation = () => {
    socketRef.current.emit("leave chat", {
      country,
      language,
      chatId: consultation.chatId,
      userType: "provider",
    });

    navigate("/consultations");
    sendMessageMutation.mutate({
      chatId: consultation.chatId,
      message: {
        time: JSON.stringify(new Date().getTime()),
        content: t("provider_left"),
        type: "system",
      },
    });
  };

  return (
    <Page
      showNavbar={width < 768 ? false : true}
      showFooter={width < 768 ? false : true}
      showEmergencyButton={false}
      classes="page__consultation"
      showGoBackArrow={false}
    >
      <div className="page__consultation__container">
        <VideoRoom
          joinWithVideo={joinWithVideo}
          consultation={consultation}
          toggleChat={toggleChat}
          leaveConsultation={leaveConsultation}
          token={token}
          t={t}
        />
        {width >= 1024 ? (
          <div>
            <div className="page__consultation__container__messages__messages-container">
              {renderAllMessages()}
            </div>
            <SendMessage handleSubmit={handleSendMessage} />
          </div>
        ) : null}
      </div>
      <Backdrop
        classes="page__consultation__chat-backdrop"
        isOpen={isChatShownOnMobile}
        onClose={() => setIsChatShownOnMobile(false)}
      >
        <div className="page__consultation__chat-backdrop__conatiner">
          <div className="page__consultation__container__messages__messages-container">
            {renderAllMessages()}
          </div>
          <SendMessage handleSubmit={handleSendMessage} />
        </div>
      </Backdrop>
    </Page>
  );
};
