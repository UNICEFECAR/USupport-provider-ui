import React, { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  Block,
  Button,
  Consultation,
  Grid,
  GridItem,
  Icon,
  Loading,
  Message,
  SystemMessage,
} from "@USupport-components-library/src";
import {
  useWindowDimensions,
  systemMessageTypes,
} from "@USupport-components-library/utils";

import {
  useGetAllPastConsultations,
  useGetChatData,
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
  const { t } = useTranslation("activity-history");

  const { width } = useWindowDimensions();

  const [selectedConsultation, setSelectedConsultation] = useState(
    preselectedConsultation
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const consultationsQuery = useGetAllPastConsultations();
  const chatQuery = useGetChatData(selectedConsultation?.chatId);

  const providerQuery = useGetProviderData()[0];
  const providerStatus = providerQuery?.data?.status;

  const handleConsultationClick = (consultation) => {
    window.scrollTo(0, 0);
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
      return (
        <GridItem key={"consultation-" + index} md={8} lg={12}>
          <Consultation
            consultation={consultation}
            overview={true}
            renderIn="provider"
            onClick={() => handleConsultationClick(consultation)}
            couponPrice={consultation.couponPrice}
            sponsorImage={consultation.sponsorImage}
            t={t}
          />
        </GridItem>
      );
    });
  };

  const renderAllMessages = () => {
    if (chatQuery.isLoading) return <Loading size="lg" />;
    if (chatQuery.data?.messages.length === 0) return <p>{t("no_messages")}</p>;
    return chatQuery.data.messages.map((message) => {
      if (message.type === "system") {
        return (
          <SystemMessage
            key={message.time}
            title={
              systemMessageTypes.includes(message.content)
                ? t(message.content)
                : message.content
            }
            date={new Date(Number(message.time))}
          />
        );
      } else {
        if (message.senderId === chatQuery.data.providerDetailId) {
          return (
            <Message
              key={message.time}
              message={message.content}
              sent
              date={new Date(Number(message.time))}
            />
          );
        } else {
          return (
            <Message
              key={message.time}
              message={message.content}
              received
              date={new Date(Number(message.time))}
            />
          );
        }
      }
    });
  };

  const selectedClientImage =
    AMAZON_S3_BUCKET + "/" + (selectedConsultation?.image || "default");

  return (
    <Block classes="activity-history">
      <div className="activity-history__content">
        {((width < 1366 && !selectedConsultation) || width >= 1366) && (
          <div className="activity-history__main-container">
            <Grid classes="activity-history__main-container__grid">
              {renderAllConsultations()}
            </Grid>
          </div>
        )}
        {((width < 1366 && selectedConsultation) || width >= 1366) && (
          <div className="activity-history__consultation-container">
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
                  <div className="activity-history__consultation-container__consultation__header__client-container">
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
                </div>
                <div className="activity-history__consultation-container__consultation__messages">
                  {chatQuery.isLoading ? (
                    <Loading size="lg" />
                  ) : (
                    renderAllMessages()
                  )}
                </div>
                {providerStatus === "active" ? (
                  <Button
                    size="lg"
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
          </div>
        )}
      </div>
    </Block>
  );
};
