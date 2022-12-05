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
import { useWindowDimensions } from "@USupport-components-library/utils";

import { useGetAllConsultationsByFilter, useGetChatData } from "#hooks";

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
export const ActivityHistory = ({ openSelectConsultation }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("activity-history");

  const { width } = useWindowDimensions();

  const [selectedConsultation, setSelectedConsultation] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const consultationsQuery = useGetAllConsultationsByFilter("past");
  const chatQuery = useGetChatData(selectedConsultation?.chatId);

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
      },
      {
        iconName: "person",
        text: t("button_view_profile_label"),
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
    return consultationsQuery.data?.map((consultation, index) => {
      return (
        <GridItem key={"consultation-" + index} md={8} lg={12}>
          <Consultation
            consultation={consultation}
            overview={true}
            renderIn="client"
            onClick={() => handleConsultationClick(consultation)}
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
      if (message.type === "system-message") {
        return (
          <SystemMessage
            key={message.time}
            title={message.content}
            date={new Date(message.time)}
          />
        );
      } else {
        if (message.senderId === chatQuery.data.providerDetailId) {
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

  const selectedClientImage =
    AMAZON_S3_BUCKET + "/" + (selectedConsultation?.image || "default");

  return (
    <Block classes="activity-history">
      <div className="activity-history__content">
        {((width < 1366 && !selectedConsultation) || width >= 1366) && (
          <div className="activity-history__main-container">
            <div className="activity-history__main-container__header">
              <h4>{t("activity_history_heading")}</h4>
              {/* <ButtonWithIcon
                iconName="filter"
                iconColor="#fff"
                color="purple"
                label={t("button_filter_label")}
                circleSize="sm"
              /> */}
            </div>
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
                <Button
                  size="lg"
                  label={t("button_propose_consultation_label")}
                  onClick={handleProposeConsultation}
                  classes="activity-history__consultation-container__consultation__button"
                />
                {isMenuOpen && (
                  <OutsideClickHandler
                    onOutsideClick={() => setIsMenuOpen(false)}
                  >
                    <div className="activity-history__consultation-container__consultation__menu">
                      {renderMenuOptions()}
                    </div>
                  </OutsideClickHandler>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Block>
  );
};
