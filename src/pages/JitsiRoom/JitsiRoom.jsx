import React, { useContext, useRef, useState, useEffect } from "react";

import { JitsiMeeting } from "@jitsi/react-sdk";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { Controls, Loading } from "@USupport-components-library/src";
import {
  useWindowDimensions,
  ThemeContext,
  ONE_HOUR,
} from "@USupport-components-library/utils";

import { Page } from "#blocks";
import { RootContext } from "#routes";
import {
  useConsultationSocket,
  useSendMessage,
  useLeaveConsultation,
  useCustomNavigate as useNavigate,
} from "#hooks";

import { MessageList } from "./MessageList";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./jitsi-room.scss";

const defaultConfig = {
  disableModeratorIndicator: true,
  startScreenSharing: false,
  enableEmailInStats: false,
  requireDisplayName: false,
  prejoinPageEnabled: false,
  disableInitialGUM: false,
  deeplinking: {
    desktop: { enabled: false },
    disabled: true,
  },
  prejoinConfig: {
    enabled: false,
  },
};

/**
 * JitsiRoom
 *
 * Jitsi
 *
 * @returns {JSX.Element}
 */
export const JitsiRoom = () => {
  const language = localStorage.getItem("language");
  const country = localStorage.getItem("country");

  const { t } = useTranslation("pages", { keyPrefix: "consultation-page" });

  const { theme } = useContext(ThemeContext);
  const { leaveConsultationFn } = useContext(RootContext);
  const navigate = useNavigate();
  const consultationRef = useRef();
  const api = useRef();
  const backdropMessagesContainerRef = useRef();

  const queryClient = useQueryClient();
  const location = useLocation();
  const { width } = useWindowDimensions();

  if (!location?.state) {
    return <Navigate to={`/provider/${language}/consultations`} />;
  }
  const { consultation, videoOn, microphoneOn, token } = location?.state;

  const [isLoading, setIsLoading] = useState(true);
  const [hideControls, setHideControls] = useState(false);
  const [interfaces, setInterfaceData] = useState({
    videoOn,
    microphoneOn,
    isChatShownOnTablet: false,
    isChatShownOnMobile: false,
    isClientTyping: false,
    hasUnreadMessages: false,
    isClientInSession: false,
  });
  const interfacesRef = useRef(interfaces);

  const [messages, setMessages] = useState({
    currentSession: [],
    previousSessions: [],
  });

  useSessionEndReminder(consultation.timestamp, t);

  const receiveMessage = (message) => {
    const interfacesCopy = { ...interfacesRef.current };
    if (message.content === "client_left") {
      interfacesCopy.isClientInSession = false;
    } else if (message.content === "client_joined") {
      interfacesCopy.isClientInSession = true;
    }
    if (!interfaces.isChatShownOnTablet && !interfaces.isChatShownOnMobile) {
      interfacesCopy.hasUnreadMessages = true;
    }
    setMessages((messages) => {
      return {
        ...messages,
        currentSession: [...messages.currentSession, message],
      };
      2;
    });
    setInterfaceData(interfacesCopy);
  };

  const socketRef = useConsultationSocket({
    chatId: consultation.chatId,
    isClientTyping: interfaces.isClientTyping,
    receiveMessage,
    setInterfaceData,
  });

  useEffect(() => {
    interfacesRef.current = interfaces;
  }, [interfaces]);

  useEffect(() => {
    // If the chat is shown but user shrinks the window:
    // hide the side chat and open the backdrop
    if (width < 1150) {
      if (interfaces.isChatShownOnTablet) {
        consultationRef.current.style.width = "100vw";
        consultationRef.current.style.height = "30vh";
        setInterfaceData({
          ...interfaces,
          isChatShownOnTablet: false,
          isChatShownOnMobile: true,
        });
      }
    } else {
      // If the chat is shown on mobile and user expands the window:
      // hide the backdrop and open the side chat
      if (interfaces.isChatShownOnMobile) {
        consultationRef.current.style.width = "calc(100vw - 50rem)";
        consultationRef.current.style.height = "100vh";
        setInterfaceData({
          ...interfaces,
          isChatShownOnTablet: true,
          isChatShownOnMobile: false,
        });
      }
    }

    if (interfaces.isChatShownOnMobile) {
      setTimeout(() => {
        setHideControls(true);
      }, 500);

      if (consultationRef.current && consultationRef.current.style) {
        consultationRef.current.style.height = "30vh";
      }
    } else {
      setTimeout(() => {
        setHideControls(false);
      }, 500);

      if (consultationRef.current && consultationRef.current.style) {
        consultationRef.current.style.height = "100vh";
      }
    }
  }, [width, interfaces.isChatShownOnMobile, consultationRef]);

  const providerData = queryClient.getQueryData({
    queryKey: ["provider-data"],
  });

  if (!consultation || !token || !providerData)
    return <Navigate to={`/provider/${language}/consultations`} />;

  const toggleChat = () => {
    const { isChatShownOnMobile, hasUnreadMessages } = interfaces;
    if (!isChatShownOnMobile) {
      setTimeout(() => {
        console.log("scroll to bottom");
        backdropMessagesContainerRef.current?.scrollTo({
          top: backdropMessagesContainerRef.current?.scrollHeight,
          behavior: "smooth",
        });
      }, 500);
    }
    if (hasUnreadMessages) {
      setInterfaceData({
        ...interfaces,
        hasUnreadMessages: false,
      });
    }
    if (width < 1150) {
      consultationRef.current.style.height = interfaces.isChatShownOnMobile
        ? "100vh"
        : "30vh";
      setInterfaceData({
        ...interfaces,
        isChatShownOnMobile: !interfaces.isChatShownOnMobile,
        hasUnreadMessages: false,
      });
    } else {
      consultationRef.current.style.width = interfaces.isChatShownOnTablet
        ? "100vw"
        : "calc(100vw - 50rem)";
      setInterfaceData({
        ...interfaces,
        isChatShownOnTablet: !interfaces.isChatShownOnTablet,
        hasUnreadMessages: false,
      });
    }
  };

  // Mutations
  const onSendSuccess = (newMessage) => {
    const message = newMessage.message;
    message.senderId = providerData.providerDetailId;

    setMessages((prev) => ({
      ...prev,
      currentSession: [...prev.currentSession, message],
    }));
  };
  const onSendError = (err) => {
    console.log(err, "err");
    toast(err, { type: "error" });
  };
  const sendMessageMutation = useSendMessage(onSendSuccess, onSendError);
  const handleSendMessage = (content, type = "text") => {
    if (interfaces.hasUnreadMessages) {
      setInterfaceData({ ...interfaces, hasUnreadMessages: false });
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

  const leaveConsultationMutation = useLeaveConsultation();

  const leaveConsultation = () => {
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

    leaveConsultationMutation.mutate({
      consultationId: consultation.consultationId,
      userType: "provider",
    });

    navigate("/consultations");
  };

  useEffect(() => {
    if (leaveConsultation) {
      leaveConsultationFn.current = leaveConsultation;
    }
  }, [leaveConsultation]);

  const userInfo = {
    displayName: `${providerData?.name}${` ${providerData?.patronym} ` || " "}${
      providerData?.surname
    }`,
    id: providerData?.providerDetailId,
    avatarURL: `${AMAZON_S3_BUCKET}/${providerData?.image}`,
  };

  return (
    <Page
      showNavbar={false}
      showFooter={false}
      showEmergencyButton={false}
      showGoBackArrow={false}
      classes="page__jitsi-room"
    >
      <div style={{ display: "flex" }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
            }}
          >
            {!hideControls && (
              <Controls
                t={t}
                consultation={consultation}
                handleSendMessage={handleSendMessage}
                leaveConsultation={leaveConsultation}
                hasUnreadMessages={interfaces.hasUnreadMessages}
                toggleCamera={() => {
                  api.current.executeCommand("toggleVideo");
                  setInterfaceData({
                    ...interfaces,
                    videoOn: !interfaces.videoOn,
                  });
                }}
                toggleMicrophone={() => {
                  api.current.executeCommand("toggleAudio");
                  setInterfaceData({
                    ...interfaces,
                    microphoneOn: !interfaces.microphoneOn,
                  });
                }}
                toggleChat={toggleChat}
                isCameraOn={interfaces.videoOn}
                isMicrophoneOn={interfaces.microphoneOn}
                renderIn="provider"
                isInSession={interfaces.isClientInSession}
              />
            )}
          </div>
        </div>
        {isLoading && (
          <div className="loading-spinner">
            <Loading />
          </div>
        )}
        <JitsiMeeting
          domain={"jitsi.usupport.online"}
          roomName={consultation.consultationId}
          ssl={false}
          spinner={Loading}
          configOverwrite={{
            ...defaultConfig,
            startWithAudioMuted: !microphoneOn,
            startWithVideoMuted: !videoOn,
            hideConferenceSubject: true,
            SETTINGS_SECTIONS: ["language"],
          }}
          interfaceConfigOverwrite={{
            SHOW_JITSI_WATERMARK: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            TOOLBAR_BUTTONS: ["raisehand", "settings", "fullscreen"],
            SHOW_ROOM_NAME: false,
            SETTINGS_SECTIONS: ["devices", "background", "language", "profile"],
          }}
          userInfo={userInfo}
          onApiReady={async (externalApi) => {
            api.current = externalApi;

            const rooms = await externalApi.getRoomsInfo();

            const roomInfo = rooms[0] || rooms?.rooms[0];
            const participants = roomInfo?.participants?.filter(
              (x) => !!x && x.id !== userInfo.id && x.id !== "local"
            );
            if (roomInfo) {
              setInterfaceData({
                ...interfaces,
                isClientInSession: participants.length > 0,
              });
            }

            externalApi.executeCommand("joinConference");
            externalApi.executeCommand(
              "avatarUrl",
              `${AMAZON_S3_BUCKET}/${providerData?.image}`
            );
            externalApi.addListener(
              "participantJoined",
              ({ displayName, id }) => {
                console.log("Participant joined: ", displayName);
                if (
                  !interfaces.isClientInSession &&
                  id !== userInfo.id &&
                  id !== "local"
                ) {
                  setInterfaceData((prev) => ({
                    ...prev,
                    isClientInSession: true,
                  }));
                }
              }
            );
            externalApi.addListener("videoConferenceLeft", () => {
              leaveConsultation();
            });
            externalApi.addListener("videoConferenceJoined", () => {
              setIsLoading(false);
            });
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100vh";
            iframeRef.style.width = "100vw";
            consultationRef.current = iframeRef;
          }}
        />
        <Chat
          t={t}
          interfaces={interfaces}
          setInterfaceData={setInterfaceData}
          providerId={providerData.providerDetailId}
          theme={theme}
          messages={messages}
          setMessages={setMessages}
          consultation={consultation}
          handleSendMessage={handleSendMessage}
          isChatShownOnMobile={interfaces.isChatShownOnMobile}
          isChatShownOnTablet={interfaces.isChatShownOnTablet}
          setIsChatShownOnMobile={(value) => {
            setInterfaceData({ ...interfaces, isChatShownOnMobile: value });
          }}
          hasUnreadMessages={interfaces.hasUnreadMessages}
          socketRef={socketRef}
          setHasUnreadMessages={(value) => {
            setInterfaceData({ ...interfaces, hasUnreadMessages: value });
          }}
          backdropMessagesContainerRef={backdropMessagesContainerRef}
        />
      </div>
    </Page>
  );
};

/**
 * Chat component that handles both mobile and desktop chat views
 */
export const Chat = ({
  interfaces,
  setInterfaceData,
  messages,
  setMessages,
  providerId,
  consultation,
  handleSendMessage,
  theme,
  t,
  isChatShownOnMobile,
  setIsChatShownOnMobile,
  isChatShownOnTablet,
  socketRef,
  hasUnreadMessages,
  setHasUnreadMessages,
  backdropMessagesContainerRef,
}) => {
  const country = localStorage.getItem("country");
  const language = localStorage.getItem("language");
  const { width } = useWindowDimensions();

  const [areMessagesHidden, setAreMessagesHidden] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [areSystemMessagesShown, setAreSystemMessagesShown] = useState(true);

  // Handle message visibility
  useEffect(() => {
    let timeout, timeoutTwo;
    const hasMessages =
      messages?.currentSession?.length > 0 ||
      messages?.previousSessions?.length > 0;

    if (hasMessages && areMessagesHidden && isChatShownOnMobile) {
      timeout = setTimeout(() => {
        if (backdropMessagesContainerRef.current) {
          backdropMessagesContainerRef.current.scrollTop =
            backdropMessagesContainerRef.current.scrollHeight;
        }
        setAreMessagesHidden(false);
      }, 1000);
    }

    if (!areMessagesHidden && !isChatShownOnMobile) {
      timeoutTwo = setTimeout(() => {
        setAreMessagesHidden(true);
      }, 300);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
      if (timeoutTwo) clearTimeout(timeoutTwo);
    };
  }, [messages, isChatShownOnMobile]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (
      (messages.currentSession?.length > 0 ||
        messages.previousSessions?.length > 0) &&
      backdropMessagesContainerRef.current &&
      backdropMessagesContainerRef.current.scrollHeight > 0 &&
      !areMessagesHidden
    ) {
      backdropMessagesContainerRef.current.scrollTo({
        top: backdropMessagesContainerRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [
    messages,
    backdropMessagesContainerRef.current?.scrollHeight,
    areMessagesHidden,
  ]);

  const emitTyping = (type) => {
    socketRef.current.emit("typing", {
      to: "client",
      language,
      country,
      chatId: consultation.chatId,
      type,
    });
  };

  const handleTextareaFocus = () => {
    if (hasUnreadMessages) {
      setHasUnreadMessages(false);
    }
  };

  const setIsClientInSession = (value) => {
    setInterfaceData({ ...interfaces, isClientInSession: value });
  };

  // Render tablet/desktop view
  return (
    <MessageList
      messages={messages}
      setMessages={setMessages}
      consultation={consultation}
      providerId={providerId}
      handleSendMessage={handleSendMessage}
      width={width}
      areSystemMessagesShown={areSystemMessagesShown}
      setAreSystemMessagesShown={setAreSystemMessagesShown}
      showOptions={showOptions}
      setShowOptions={setShowOptions}
      isClientTyping={interfaces.isClientTyping}
      setIsClientInSession={setIsClientInSession}
      showAllMessages={showAllMessages}
      setShowAllMessages={setShowAllMessages}
      onTextareaFocus={handleTextareaFocus}
      emitTyping={emitTyping}
      isChatShownOnTablet={isChatShownOnTablet}
      isChatShownOnMobile={isChatShownOnMobile}
      setIsChatShownOnMobile={setIsChatShownOnMobile}
      areMessagesHidden={areMessagesHidden}
      setAreMessagesHidden={setAreMessagesHidden}
      backdropMessagesContainerRef={backdropMessagesContainerRef}
      handleTextareaFocus={handleTextareaFocus}
      theme={theme}
      t={t}
    />
  );
};

const useSessionEndReminder = (timestamp, t) => {
  useEffect(() => {
    const endTime = new Date(timestamp + ONE_HOUR);
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
};
