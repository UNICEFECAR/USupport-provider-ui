import React, { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useTranslation } from "react-i18next";
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
import { useGetAllConsultationsByFilter } from "#hooks";

import "./activity-history.scss";

import { mascotHappyPurpleFull as mascot } from "@USupport-components-library/assets";

/**
 * ActivityHistory
 *
 * ActivityHistory
 *
 * @return {jsx}
 */
export const ActivityHistory = ({ openSelectConsultation }) => {
  const { t } = useTranslation("activity-history");

  const { width } = useWindowDimensions();

  const [selectedConsultation, setSelectedConsultation] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const daysOfWeekTranslations = {
    monday: t("monday"),
    tuesday: t("tuesday"),
    wednesday: t("wednesday"),
    thursday: t("thursday"),
    friday: t("friday"),
    saturday: t("saturday"),
    sunday: t("sunday"),
  };

  const consultationsQuery = useGetAllConsultationsByFilter("past");

  const consultationsMessages = [
    {
      type: "system-message",
      message: "Consultation started",
      date: new Date("10.25.2022 14:30"),
    },
    {
      type: "message",
      senderId: "1",
      receiverId: "2",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
      date: new Date("10.25.2022 14:32"),
    },
    {
      type: "message",
      senderId: "2",
      receiverId: "1",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
      date: new Date("10.25.2022 14:35"),
    },
    {
      type: "message",
      senderId: "1",
      receiverId: "2",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
      date: new Date("10.25.2022 14:32"),
    },
    {
      type: "message",
      senderId: "2",
      receiverId: "1",
      message: "yes.",
      date: new Date("10.25.2022 14:35"),
    },
    {
      type: "message",
      senderId: "1",
      receiverId: "2",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
      date: new Date("10.25.2022 14:32"),
    },
    {
      type: "message",
      senderId: "2",
      receiverId: "1",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
      date: new Date("10.25.2022 14:35"),
    },
    {
      type: "system-message",
      message: "Consultation ended",
      date: new Date("10.25.2022 15:30"),
    },
  ];

  const id = "1";

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
        onClick: () => {},
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
            daysOfWeekTranslations={daysOfWeekTranslations}
          />
        </GridItem>
      );
    });
  };

  const renderAllMessages = () => {
    return consultationsMessages.map((message) => {
      if (message.type === "system-message") {
        return (
          <SystemMessage
            key={message.date.getTime()}
            title={message.message}
            date={message.date}
          />
        );
      } else {
        if (message.senderId === id) {
          return (
            <Message
              key={message.date.getTime()}
              message={message.message}
              sent
              date={message.date}
            />
          );
        } else {
          return (
            <Message
              key={message.date.getTime()}
              message={message.message}
              received
              date={message.date}
            />
          );
        }
      }
    });
  };

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
                    {/* TODO: refactor to display the name and image of the client  */}
                    <Avatar size="sm" />
                    <h4 className="client-name">{selectedConsultation.name}</h4>
                  </div>
                  <Icon
                    name="three-dots-vertical"
                    color="#20809E"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  />
                </div>
                <div className="activity-history__consultation-container__consultation__messages">
                  {renderAllMessages()}
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
