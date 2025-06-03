import React, { useEffect, useRef, useState, useCallback } from "react";
import { OptionsContainer } from "./OptionsContainer";

import { useGetChatData, useDebounce } from "#hooks";

import {
  Loading,
  SendMessage,
  SystemMessage,
  Message,
  TypingIndicator,
  Backdrop,
} from "@USupport-components-library/src";

import {
  getDateView,
  systemMessageTypes,
} from "@USupport-components-library/src/utils";

export const MessageList = ({
  messages,
  setMessages,
  consultation,
  providerId,
  width,
  handleSendMessage,
  areSystemMessagesShown,
  setAreSystemMessagesShown,
  showOptions,
  setShowOptions,
  showAllMessages,
  setShowAllMessages,
  isClientTyping,
  setIsClientInSession,
  onTextareaFocus,
  emitTyping,
  search,
  setSearch,
  isChatShownOnTablet,
  isChatShownOnMobile,
  setIsChatShownOnMobile,
  areMessagesHidden,
  backdropMessagesContainerRef,
  handleTextareaFocus,
  theme,
  t,
}) => {
  const messagesContainerRef = useRef();
  const [showMessages, setShowMessages] = useState(false);
  // const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMessages(true);
    }, 200);

    return () => {
      clearTimeout(timeout);
      setShowMessages(false);
    };
  }, []);

  const belowMessagesRef = useRef(null);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    let timeout;
    if (
      messages?.currentSession?.length > 0 ||
      messages?.previousSessions?.length > 0
    ) {
      timeout = setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
        setIsHidden(false);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [messages]);

  useEffect(() => {
    let timeout;
    if (
      (messages.currentSession?.length > 0 ||
        messages.previousSessions?.length > 0) &&
      messagesContainerRef.current?.scrollHeight > 0 &&
      showMessages &&
      !isHidden
    ) {
      timeout = setTimeout(() => {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current?.scrollHeight,
          behavior: "smooth",
        });
      }, 300);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [
    messages,
    isChatShownOnTablet,
    messagesContainerRef.current?.scrollHeight,
    showMessages,
    isHidden,
  ]);

  const checkHasClientJoined = (messages) => {
    // Sort the messages by time descending so the latest messages are first
    // Then check which one of the following two cases is true:
    const joinMessages = messages
      .filter(
        (x) => x.content === "client_joined" || x.content === "client_left"
      )
      .sort((a, b) => new Date(Number(b.time)) - new Date(Number(a.time)));
    if (joinMessages.length === 0) return false;
    return joinMessages[0].content === "client_joined";
  };

  const onGetChatDataSuccess = (data) => {
    // setIsClientInSession(checkHasClientJoined(data.messages));
    setMessages((prev) => ({
      ...prev,
      currentSession: data.messages,
    }));
  };

  const chatDataQuery = useGetChatData(
    consultation?.chatId,
    onGetChatDataSuccess
  );

  const renderAllMessages = useCallback(() => {
    if (chatDataQuery.isLoading) return <Loading size="lg" />;

    let messagesToShow = showAllMessages
      ? [...messages.previousSessions, ...messages.currentSession]
      : messages.currentSession;
    messagesToShow.sort((a, b) => new Date(a.time) - new Date(b.time));
    if (debouncedSearch) {
      messagesToShow = messagesToShow.filter((message) =>
        message.content?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    let lastDate;
    const messagesToReturn = messagesToShow.map((message, index) => {
      let shouldShowDate = false;
      const currentMessageDate = getDateView(new Date(Number(message.time)));
      if (currentMessageDate !== lastDate) {
        shouldShowDate = true;
        lastDate = currentMessageDate;
      }
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
            showDate={shouldShowDate}
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
              showDate={shouldShowDate}
            />
          );
        } else {
          return (
            <Message
              key={`${message.time}-${index}`}
              message={message.content}
              received
              date={new Date(Number(message.time))}
              showDate={shouldShowDate}
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

  return (
    <React.Fragment>
      {
        // width >= 1024 ?
        width >= 1150 && isChatShownOnTablet ? (
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
            {isHidden && <Loading />}

            <div
              ref={messagesContainerRef}
              className={`page__consultation__container__messages__messages-container ${
                showOptions
                  ? "page__consultation__container__messages__messages-container--show-options"
                  : ""
              }`}
              style={{
                visibility: isHidden ? "hidden" : "visible",
              }}
            >
              {showMessages && renderAllMessages()}
            </div>

            <div
              ref={belowMessagesRef}
              style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
            >
              <SendMessage
                t={t}
                handleSubmit={handleSendMessage}
                onTextareaFocus={onTextareaFocus}
                emitTyping={emitTyping}
              />
            </div>
          </div>
        ) : null
      }
      <Backdrop
        classes={[
          "page__consultation__chat-backdrop",
          theme === "dark" && "page__consultation__chat-backdrop--dark",
        ].join(" ")}
        isOpen={isChatShownOnMobile && width < 1150}
        onClose={() => setIsChatShownOnMobile(false)}
        showAlwaysAsBackdrop
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
          {areMessagesHidden && <Loading size="lg" />}
          <div
            ref={backdropMessagesContainerRef}
            className="page__consultation__container__messages__messages-container"
            style={{
              visibility: areMessagesHidden ? "hidden" : "visible",
            }}
          >
            {renderAllMessages()}
          </div>
          {isChatShownOnMobile && width < 1150 && (
            <SendMessage
              t={t}
              handleSubmit={handleSendMessage}
              onTextareaFocus={handleTextareaFocus}
              emitTyping={emitTyping}
            />
          )}
        </div>
      </Backdrop>
    </React.Fragment>
  );
};
