import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import io from "socket.io-client";

import {
  Backdrop,
  Button,
  InputSearch,
  Loading,
  Message,
  SendMessage,
  SystemMessage,
  Toggle,
  TypingIndicator,
} from "@USupport-components-library/src";
import {
  useWindowDimensions,
  ONE_HOUR,
} from "@USupport-components-library/utils";

import {
  useGetChatData,
  useSendMessage,
  useLeaveConsultation,
  useDebounce,
  useGetAllChatHistoryData,
} from "#hooks";
import { Page, VideoRoom } from "#blocks";
import { RootContext } from "#routes";

import { Logger } from "twilio-video";
const logger = Logger.getLogger("twilio-video");
logger.setLevel("silent");

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
  const language = localStorage.getItem("language");
  const country = localStorage.getItem("country");
  const { width } = useWindowDimensions();
  const navigate = useNavigate();
  const location = useLocation();
  const backdropMessagesContainerRef = useRef();
  const socketRef = useRef();

  const consultation = location.state?.consultation;
  const joinWithVideo = location.state?.videoOn;
  const joinWithMicrophone = location.state?.microphoneOn;
  const token = location.state?.token;

  const { leaveConsultationFn } = useContext(RootContext);

  if (!consultation) return <Navigate to="/consultations" />;

  const [isChatShownOnMobile, setIsChatShownOnMobile] = useState(
    !joinWithVideo
  );

  const [messages, setMessages] = useState({
    currentSession: [],
    previousSessions: [],
  });
  const [areSystemMessagesShown, setAreSystemMessagesShown] = useState(true);

  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [search, setSearch] = useState("");
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true);
  const [isClientTyping, setIsClientTyping] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const chatDataQuery = useGetChatData(consultation?.chatId, (data) => {
    setMessages((prev) => ({
      ...prev,
      currentSession: data.messages,
    }));
  });

  const clientId = chatDataQuery.data?.clientDetailId;
  const providerId = chatDataQuery.data?.providerDetailId;
  const allChatHistoryQuery = useGetAllChatHistoryData(
    providerId,
    clientId,
    true
  );

  useEffect(() => {
    const endTime = new Date(consultation.timestamp + ONE_HOUR);
    let isTenMinAlertShown,
      isFiveMinAlertShown = false;

    const interval = setInterval(() => {
      const now = new Date();
      const timeDifferenceInMinutes = Math.floor((endTime - now) / (1000 * 60));

      if (timeDifferenceInMinutes <= 10 && !isTenMinAlertShown) {
        toast(t("consultation_end_reminder", { minutes: 10 }), {
          autoClose: false,
          type: "info",
        });
        isTenMinAlertShown = true;
      }
      if (timeDifferenceInMinutes <= 5 && !isFiveMinAlertShown) {
        toast(t("consultation_end_reminder", { minutes: 5 }), {
          autoClose: false,
          type: "info",
        });
        isFiveMinAlertShown;
        clearInterval(interval);
      }
    }, 20000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (
      allChatHistoryQuery.data?.messages &&
      !messages.previousSessions.length
    ) {
      setMessages((prev) => {
        return {
          ...prev,
          previousSessions: allChatHistoryQuery.data.messages,
        };
      });
    }
  }, [allChatHistoryQuery.data]);

  // TODO: Send a consultation add services request only when the provider leaves the consultation
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
    socketRef.current.on("typing", (type) => {
      if (!isClientTyping && type == "typing") {
        setIsClientTyping(true);
      } else if (type === "stop") {
        setIsClientTyping(false);
      }
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
        chatId: consultation.chatId,
        to: "client",
        message: systemMessage,
      });
    }, 1500);

    const handleBeforeUnload = () => {
      leaveConsultation();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll the messages container to the bottom when a new message is received
  useEffect(() => {
    if (
      (messages.currentSession?.length > 0 ||
        messages.previousSessions?.length > 0) &&
      backdropMessagesContainerRef.current &&
      backdropMessagesContainerRef.current.scrollHeight > 0
    ) {
      backdropMessagesContainerRef.current.scrollTo({
        top: backdropMessagesContainerRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [
    messages,
    backdropMessagesContainerRef.current?.scrollHeight,
    debouncedSearch,
  ]);

  const onSendSuccess = (newMessage) => {
    const message = newMessage.message;
    message.senderId = providerId;
    setMessages((prev) => ({
      ...prev,
      currentSession: [...prev.currentSession, message],
    }));
  };
  const onSendError = (err) => {
    toast(err, { type: "error" });
  };
  const sendMessageMutation = useSendMessage(onSendSuccess, onSendError);
  const leaveConsultationMutation = useLeaveConsultation();

  const receiveMessage = (message) => {
    setHasUnreadMessages(true);
    setMessages((messages) => {
      return {
        ...messages,
        currentSession: [...messages.currentSession, message],
      };
    });
  };

  const systemMessageTypes = [
    "client_joined",
    "client_left",
    "client_microphone_on",
    "client_microphone_off",
    "client_camera_on",
    "client_camera_off",
    "provider_joined",
    "provider_left",
    "provider_microphone_on",
    "provider_microphone_off",
    "provider_camera_on",
    "provider_camera_off",
  ];

  const renderAllMessages = useCallback(() => {
    if (chatDataQuery.isLoading) return <Loading size="lg" />;

    let messagesToShow = showAllMessages
      ? [...messages.previousSessions, ...messages.currentSession]
      : messages.currentSession;
    messagesToShow?.sort((a, b) => new Date(a.time) - new Date(b.time));
    if (debouncedSearch) {
      messagesToShow = messagesToShow?.filter((message) =>
        message.content?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    const messagesToReturn = messagesToShow?.map((message, index) => {
      if (message.type === "system") {
        if (!areSystemMessagesShown) return null;
        return (
          <SystemMessage
            key={`${message.time}-${index}`}
            title={
              systemMessageTypes.includes(message.content)
                ? t(message.content)
                : message.content
            }
            date={new Date(Number(message.time))}
          />
        );
      } else {
        if (message.senderId === providerId) {
          return (
            <Message
              key={`${message.time}-${index}`}
              message={message.content}
              sent
              date={new Date(Number(message.time))}
            />
          );
        } else {
          return (
            <Message
              key={`${message.time}-${index}`}
              message={message.content}
              received
              date={new Date(Number(message.time))}
            />
          );
        }
      }
    });

    if (isClientTyping) {
      messagesToReturn.push(<TypingIndicator text={t("typing")} />);
    }

    return messagesToReturn;
  }, [
    messages,
    chatDataQuery.isLoading,
    providerId,
    areSystemMessagesShown,
    debouncedSearch,
    showAllMessages,
    isClientTyping,
  ]);

  const handleSendMessage = (content, type = "text") => {
    if (hasUnreadMessages) {
      setHasUnreadMessages(false);
    }
    const message = {
      content,
      type,
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

  const [isChatShownOnTablet, setIsChatShownOnTablet] = useState(true);
  const toggleChat = () => {
    if (!isChatShownOnMobile) {
      setTimeout(() => {
        backdropMessagesContainerRef.current?.scrollTo({
          top: backdropMessagesContainerRef.current?.scrollHeight,
          behavior: "smooth",
        });
      }, 200);
    }
    if (!isChatShownOnMobile && hasUnreadMessages) {
      setHasUnreadMessages(false);
    }
    if (width < 1024) {
      setIsChatShownOnMobile(!isChatShownOnMobile);
    } else {
      setIsChatShownOnTablet(!isChatShownOnTablet);
    }
  };

  const leaveConsultation = () => {
    leaveConsultationMutation.mutate({
      consultationId: consultation.consultationId,
      userType: "provider",
    });

    const leaveMessage = {
      time: JSON.stringify(new Date().getTime()),
      content: "provider_left",
      type: "system",
    };

    sendMessageMutation.mutate({
      chatId: consultation.chatId,
      message: leaveMessage,
    });

    socketRef.current.emit("send message", {
      language,
      country,
      chatId: consultation.chatId,
      to: "client",
      message: leaveMessage,
    });

    navigate("/consultations");
  };

  useEffect(() => {
    if (leaveConsultation) {
      leaveConsultationFn.current = leaveConsultation;
    }
  }, [leaveConsultation]);

  const handleTextareaFocus = () => {
    if (hasUnreadMessages) {
      setHasUnreadMessages(false);
    }
  };

  const emitTyping = (type) => {
    socketRef.current.emit("typing", {
      to: "client",
      language,
      country,
      chatId: consultation.chatId,
      type,
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
          joinWithMicrophone={joinWithMicrophone}
          consultation={consultation}
          toggleChat={toggleChat}
          leaveConsultation={leaveConsultation}
          handleSendMessage={handleSendMessage}
          hasUnreadMessages={hasUnreadMessages}
          token={token}
          t={t}
        />
        {isChatShownOnTablet && (
          <MessageList
            messages={messages}
            handleSendMessage={handleSendMessage}
            width={width}
            areSystemMessagesShown={areSystemMessagesShown}
            setAreSystemMessagesShown={setAreSystemMessagesShown}
            showOptions={showOptions}
            setShowOptions={setShowOptions}
            search={search}
            setSearch={setSearch}
            showAllMessages={showAllMessages}
            setShowAllMessages={setShowAllMessages}
            onTextareaFocus={handleTextareaFocus}
            renderAllMessages={renderAllMessages}
            emitTyping={emitTyping}
            t={t}
          />
        )}
      </div>
      <Backdrop
        classes="page__consultation__chat-backdrop"
        isOpen={isChatShownOnMobile}
        onClose={() => setIsChatShownOnMobile(false)}
        reference={width < 768 ? backdropMessagesContainerRef : null}
        headingComponent={
          <OptionsContainer
            showOptions={showOptions}
            setShowOptions={setShowOptions}
            search={search}
            setSearch={setSearch}
            showAllMessages={showAllMessages}
            setShowAllMessages={setShowAllMessages}
            areSystemMessagesShown={areSystemMessagesShown}
            setAreSystemMessagesShown={setAreSystemMessagesShown}
            t={t}
          />
        }
      >
        <div className="page__consultation__chat-backdrop__container">
          <div
            ref={width >= 768 ? backdropMessagesContainerRef : null}
            className={`page__consultation__container__messages__messages-container ${
              showOptions
                ? "page__consultation__container__messages__messages-container--show-options"
                : ""
            }`}
          >
            {renderAllMessages()}
            <div
              style={{
                width: "100%",
                marginBottom: width >= 768 ? "100px" : "50px",
              }}
            />
          </div>
          {(isChatShownOnMobile || width >= 768) && (
            <SendMessage
              handleSubmit={handleSendMessage}
              onTextareaFocus={handleTextareaFocus}
              emitTyping={emitTyping}
            />
          )}
        </div>
      </Backdrop>
    </Page>
  );
};

const MessageList = ({
  messages,
  width,
  handleSendMessage,
  areSystemMessagesShown,
  setAreSystemMessagesShown,
  showOptions,
  setShowOptions,
  search,
  setSearch,
  showAllMessages,
  setShowAllMessages,
  onTextareaFocus,
  renderAllMessages,
  emitTyping,
  t,
}) => {
  const messagesContainerRef = useRef();
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMessages(true);
    }, 200);

    return () => {
      clearTimeout(timeout);
      setShowMessages(false);
    };
  }, []);

  useEffect(() => {
    if (
      (messages.currentSession?.length > 0 ||
        messages.previousSessions?.length > 0) &&
      messagesContainerRef.current &&
      messagesContainerRef.current.scrollHeight > 0 &&
      showMessages
    ) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, messagesContainerRef.current?.scrollHeight, showMessages]);

  return width >= 1024 ? (
    <div style={{ position: "relative" }}>
      <OptionsContainer
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        search={search}
        setSearch={setSearch}
        showAllMessages={showAllMessages}
        setShowAllMessages={setShowAllMessages}
        areSystemMessagesShown={areSystemMessagesShown}
        setAreSystemMessagesShown={setAreSystemMessagesShown}
        isAbsolute
        t={t}
      />
      <div
        ref={messagesContainerRef}
        className={`page__consultation__container__messages__messages-container ${
          showOptions
            ? "page__consultation__container__messages__messages-container--show-options"
            : ""
        }`}
      >
        {showMessages && renderAllMessages()}
      </div>
      <SendMessage
        handleSubmit={handleSendMessage}
        onTextareaFocus={onTextareaFocus}
        emitTyping={emitTyping}
      />
    </div>
  ) : null;
};

const OptionsContainer = ({
  showAllMessages,
  setShowAllMessages,
  showOptions,
  setShowOptions,
  areSystemMessagesShown,
  setAreSystemMessagesShown,
  search,
  setSearch,
  isAbsolute,
  t,
}) => {
  return (
    <div
      style={{
        position: isAbsolute ? "absolute" : "static",
      }}
      className="page__consultation__options-container"
    >
      <Button
        size="sm"
        label={t(showOptions ? "hide_options" : "show_options")}
        onClick={() => setShowOptions(!showOptions)}
        style={{ marginBottom: "16px" }}
      />
      {showOptions && (
        <div>
          <div className="page__consultation__system-message-toggle">
            <Toggle
              isToggled={areSystemMessagesShown}
              setParentState={setAreSystemMessagesShown}
            />
            <p>{t("show_system_messages")}</p>
          </div>
          <div className="page__consultation__system-message-toggle">
            <Toggle
              isToggled={showAllMessages}
              setParentState={setShowAllMessages}
            />
            <p>{t("show_previous_consultations")}</p>
          </div>
          <InputSearch
            value={search}
            onChange={setSearch}
            placeholder={t("search")}
          />
        </div>
      )}
    </div>
  );
};
