import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

import {
  Avatar,
  Block,
  Box,
  Consultation,
  Grid,
  GridItem,
  Icon,
  Loading,
  Message,
  NewButton,
  SystemMessage,
} from "@USupport-components-library/src";
import {
  useWindowDimensions,
  systemMessageTypes,
} from "@USupport-components-library/utils";

import {
  useGetAllPastConsultations,
  useGetChatDataPaginated,
  useGetProviderData,
} from "#hooks";

import "./activity-history.scss";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import { mascotHappyPurpleFull as mascot } from "@USupport-components-library/assets";

/**
 * ActivityHistory
 *
 * ActivityHistory
 *
 * @return {jsx}
 */
export const ActivityHistory = ({
  openSelectConsultation,
  preselectedConsultation,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("blocks", { keyPrefix: "activity-history" });

  const { width } = useWindowDimensions();

  const [selectedConsultation, setSelectedConsultation] = useState(
    preselectedConsultation
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const consultationsQuery = useGetAllPastConsultations();
  const chatQuery = useGetChatDataPaginated(selectedConsultation?.chatId);

  const providerQuery = useGetProviderData()[0];
  const providerStatus = providerQuery?.data?.status;

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const pendingScrollRestoreRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);

  const isNearBottom = useCallback((container, threshold = 48) => {
    if (!container) return false;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold
    );
  }, []);

  const scrollMessagesToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    isProgrammaticScrollRef.current = true;
    container.scrollTop = container.scrollHeight;
    requestAnimationFrame(() => {
      isProgrammaticScrollRef.current = false;
    });
  }, []);

  const handleConsultationClick = (consultation) => {
    console.log("[ActivityHistory] selected consultation", {
      consultationId: consultation.consultationId,
      chatId: consultation.chatId,
      clientDetailId: consultation.clientDetailId,
    });
    window.scrollTo(0, 0);
    shouldStickToBottomRef.current = true;
    pendingScrollRestoreRef.current = null;
    prevMessageCountRef.current = 0;
    setSelectedConsultation(consultation);
  };

  const handleGoBack = () => {
    window.scrollTo(0, 0);
    setSelectedConsultation("");
  };

  const handleProposeConsultation = () => {
    setIsMenuOpen(false);
    openSelectConsultation(selectedConsultation.clientDetailId);
  };

  const {
    messages: chatMessages,
    providerDetailId,
    isLoading: isChatLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = chatQuery;

  const loadOlderMessages = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const container = messagesContainerRef.current;
    if (container) {
      pendingScrollRestoreRef.current = container.scrollHeight;
    }
    shouldStickToBottomRef.current = false;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || isFetchingNextPage) return;

    // Ignore scroll events we caused while sticking to bottom
    if (!isProgrammaticScrollRef.current) {
      if (shouldStickToBottomRef.current && !isNearBottom(container)) {
        shouldStickToBottomRef.current = false;
      }
    }

    if (container.scrollTop <= 80) {
      loadOlderMessages();
    }
  }, [loadOlderMessages, isFetchingNextPage, isNearBottom]);

  // Reset stick-to-bottom whenever the selected chat changes
  useLayoutEffect(() => {
    shouldStickToBottomRef.current = true;
    pendingScrollRestoreRef.current = null;
    prevMessageCountRef.current = 0;
  }, [selectedConsultation?.chatId]);

  // Preserve viewport when older messages are prepended.
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || isChatLoading) return;

    const previousCount = prevMessageCountRef.current;
    const nextCount = chatMessages.length;
    prevMessageCountRef.current = nextCount;

    if (
      pendingScrollRestoreRef.current != null &&
      !isFetchingNextPage &&
      nextCount > previousCount
    ) {
      const previousHeight = pendingScrollRestoreRef.current;
      pendingScrollRestoreRef.current = null;
      container.scrollTop = container.scrollHeight - previousHeight;
    }
  }, [
    isChatLoading,
    chatMessages,
    isFetchingNextPage,
    selectedConsultation?.chatId,
  ]);

  // Keep scrolling to bottom until layout has settled near the end.
  // Clearing after a single rAF was flaky with cached chats / late layout.
  useLayoutEffect(() => {
    if (!shouldStickToBottomRef.current) return;
    if (isChatLoading) return;
    if (!selectedConsultation?.chatId) {
      shouldStickToBottomRef.current = false;
      return;
    }
    if (chatMessages.length === 0) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    const stick = () => {
      if (cancelled || !shouldStickToBottomRef.current) return;
      scrollMessagesToBottom();
      attempts += 1;

      if (isNearBottom(container) || attempts >= maxAttempts) {
        shouldStickToBottomRef.current = false;
        return;
      }
      requestAnimationFrame(stick);
    };

    stick();

    const resizeObserver = new ResizeObserver(() => {
      if (cancelled || !shouldStickToBottomRef.current) return;
      scrollMessagesToBottom();
      if (isNearBottom(container)) {
        shouldStickToBottomRef.current = false;
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [
    selectedConsultation?.chatId,
    isChatLoading,
    chatMessages.length,
    scrollMessagesToBottom,
    isNearBottom,
  ]);

  const renderMenuOptions = () => {
    const options = [
      {
        iconName: "share-front",
        text: t("button_propose_consultation_label"),
        onClick: handleProposeConsultation,
        value: "suggest-consultation",
      },
      {
        iconName: "person",
        text: t("button_view_profile_label"),
        value: "view-profile",
        onClick: () =>
          navigate("/clients", {
            state: {
              clientInformation: {
                clientDetailId: selectedConsultation.clientDetailId,
                name: selectedConsultation.clientName,
                image: selectedConsultation.image,
              },
            },
          }),
      },
    ];

    return options.map((option, index) => {
      if (
        providerStatus !== "active" &&
        option.value === "suggest-consultation"
      ) {
        return null;
      }
      return (
        <div
          className="menu-option"
          onClick={option.onClick}
          key={"menu-option" + index}
        >
          <Icon
            name={option.iconName}
            color={"#373737"}
            classes="menu-option__icon"
          />
          <p className="small-text">{option.text}</p>
        </div>
      );
    });
  };

  const renderAllConsultations = () => {
    if (consultationsQuery.isLoading)
      return (
        <GridItem md={8} lg={12}>
          <Loading size="lg" />
        </GridItem>
      );
    if (consultationsQuery.data?.length === 0)
      return (
        <GridItem md={8} lg={12}>
          <p className="">{t("no_activity_history")}</p>
        </GridItem>
      );

    return consultationsQuery.data?.map((consultation, index) => {
      const isSelected =
        selectedConsultation?.consultationId === consultation.consultationId;

      return (
        <GridItem key={"consultation-" + index} md={8} lg={12}>
          <Consultation
            consultation={consultation}
            overview={true}
            renderIn="provider"
            onClick={() => handleConsultationClick(consultation)}
            couponPrice={consultation.couponPrice}
            sponsorImage={consultation.sponsorImage}
            withOrganization={!!consultation.organizationId}
            classes={
              isSelected
                ? "consultation--selected activity-history__consultation--selected"
                : undefined
            }
            t={t}
          />
        </GridItem>
      );
    });
  };

  const renderAllMessages = () => {
    // Disabled query stays "loading" forever when chatId is missing
    if (!selectedConsultation?.chatId) {
      return <p>{t("no_messages")}</p>;
    }
    if (isChatLoading) return <Loading size="lg" />;
    if (chatMessages.length === 0) return <p>{t("no_messages")}</p>;

    return (
      <>
        {isFetchingNextPage && (
          <div className="activity-history__consultation-container__consultation__messages__loading-older">
            <Loading size="sm" />
          </div>
        )}
        {chatMessages.map((message, index) => {
          if (message.type === "system") {
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
          }

          if (message.senderId === providerDetailId) {
            return (
              <Message
                key={`${message.time}-${index}`}
                message={message.content}
                sent
                date={new Date(Number(message.time))}
              />
            );
          }

          return (
            <Message
              key={`${message.time}-${index}`}
              message={message.content}
              received
              date={new Date(Number(message.time))}
            />
          );
        })}
        <div ref={messagesEndRef} aria-hidden="true" />
      </>
    );
  };

  const selectedClientImage =
    AMAZON_S3_BUCKET + "/" + (selectedConsultation?.image || "default");

  return (
    <Block classes="activity-history activity-history--v1">
      <div className="activity-history__content">
        {((width < 1366 && !selectedConsultation) || width >= 1366) && (
          <Box classes="activity-history__main-container">
            <Grid classes="activity-history__main-container__grid">
              {renderAllConsultations()}
            </Grid>
          </Box>
        )}
        {((width < 1366 && selectedConsultation) || width >= 1366) && (
          <Box classes="activity-history__consultation-container">
            {!selectedConsultation ? (
              <div className="activity-history__consultation-container__no-selected">
                <img src={mascot} alt="Mascot" className="mascot" />
                <h4 className="activity-history__consultation-container__no-selected__text">
                  {t("no_consultation_selected")}
                </h4>
              </div>
            ) : (
              <div className="activity-history__consultation-container__consultation">
                <div className="activity-history__consultation-container__consultation__header">
                  <Box
                    liquidGlass
                    classes="activity-history__consultation-container__consultation__header__client-container"
                  >
                    <div className="activity-history__consultation-container__consultation__header__client-container__identity">
                      {width < 1366 && (
                        <Icon
                          name="arrow-chevron-back"
                          color="#20809E"
                          onClick={() => handleGoBack()}
                        />
                      )}
                      <Avatar size="sm" image={selectedClientImage} />
                      <h4 className="client-name">
                        {selectedConsultation.clientName}
                      </h4>
                    </div>
                    <Icon
                      name="three-dots-vertical"
                      color="#20809E"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    />
                  </Box>
                </div>
                <div
                  className="activity-history__consultation-container__consultation__messages"
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                >
                  {!selectedConsultation?.chatId || !isChatLoading ? (
                    renderAllMessages()
                  ) : (
                    <Loading size="lg" />
                  )}
                </div>
                {providerStatus === "active" ? (
                  <NewButton
                    type="gradient"
                    size="lg"
                    iconName="share-front"
                    label={t("button_propose_consultation_label")}
                    onClick={handleProposeConsultation}
                    classes="activity-history__consultation-container__consultation__button"
                  />
                ) : null}
              </div>
            )}
            {isMenuOpen && (
              <OutsideClickHandler onOutsideClick={() => setIsMenuOpen(false)}>
                <div className="activity-history__consultation-container__consultation__menu">
                  {renderMenuOptions()}
                </div>
              </OutsideClickHandler>
            )}
          </Box>
        )}
      </div>
    </Block>
  );
};
