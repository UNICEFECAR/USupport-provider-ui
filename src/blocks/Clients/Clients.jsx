import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import OutsideClickHandler from "react-outside-click-handler";
import {
  Avatar,
  Block,
  Box,
  Button,
  ClientHistory,
  Consultation,
  Grid,
  GridItem,
  Icon,
  InputSearch,
  Loading,
  Message,
  SystemMessage,
} from "@USupport-components-library/src";
import { mascotHappyPurpleFull as mascot } from "@USupport-components-library/assets";
import { useGetAllClients, useGetPastConsultationsByClientId } from "#hooks";

import "./clients.scss";

import { useWindowDimensions } from "@USupport-components-library/src/utils";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

/**
 * Clients
 *
 * Clients block
 *
 * @return {jsx}
 */
export const Clients = ({ openCancelConsultation, openSelectConsultation }) => {
  const { t } = useTranslation("clients");

  const { width } = useWindowDimensions();

  const [selectedClient, setSelectedClient] = useState(null);

  const [selectedConsultationId, setSelectedConsultationId] = useState("");

  const daysOfWeekTranslations = {
    monday: t("monday"),
    tuesday: t("tuesday"),
    wednesday: t("wednesday"),
    thursday: t("thursday"),
    friday: t("friday"),
    saturday: t("saturday"),
    sunday: t("sunday"),
  };

  const clientsQuery = useGetAllClients();
  const handleProposeConsultation = () => {
    console.log("Propose consultation");
  };

  const handleConsultationClick = (id) => {
    setSelectedConsultationId(id);
  };

  const handleCancelConsultation = (consultation) => {
    openCancelConsultation(consultation);
  };

  const handleSuggestConsultation = () => {
    openSelectConsultation(selectedClient.clientDetailId);
  };

  const renderAllClients = () => {
    return clientsQuery.data?.map((client, index) => {
      return (
        <GridItem lg={6} key={index}>
          <ClientHistory
            name={client.name}
            image={client.image}
            timestamp={client.nextConsultation}
            clientId={client.clientDetailId}
            nextConsultationId={client.nextConsultationId}
            pastConsultations={client.pastConsultations}
            handleClick={() => setSelectedClient(client)}
            cancelConsultation={handleCancelConsultation}
            suggestConsultation={handleSuggestConsultation}
            suggested={client.nextConsultationStatus === "suggested"}
            daysOfWeekTranslations={daysOfWeekTranslations}
          />
        </GridItem>
      );
    });
  };

  return (
    <Block classes="clients">
      {selectedClient && !selectedConsultationId ? (
        <div className="clients__go-back-arrow-container">
          <Icon
            onClick={() => setSelectedClient(null)}
            classes="clients__go-back-icon"
            name="arrow-chevron-back"
            color="#20809E"
          />
        </div>
      ) : null}
      {!selectedClient ? (
        <div className="clients__clients-container">
          <div className="clients__clients-container__header">
            <h3 className="clients__clients-container__header__text">
              {t("clients_heading")}
            </h3>
            <InputSearch
              placeholder={t("input_search_placeholder")}
              classes="clients__clients-container__header__input"
            />
          </div>
          <Grid classes="clients__clients-container__grid">
            {renderAllClients()}
          </Grid>
        </div>
      ) : null}
      {selectedClient ? (
        <div className="clients__content">
          {((width < 1366 && !selectedConsultationId) || width >= 1366) && (
            <ConsultationsHistory
              clientName={selectedClient.name}
              image={selectedClient.image}
              handleConsultationClick={handleConsultationClick}
              proposeConsultationLabel={t("propose_consultation_label")}
              daysOfWeekTranslations={daysOfWeekTranslations}
              selectedClient={selectedClient}
            />
          )}
          {((width < 1366 && selectedConsultationId) || width >= 1366) && (
            <ConsultationDetails
              consultationId={selectedConsultationId}
              handleGoBack={() => setSelectedConsultationId("")}
              screenWidth={width}
              proposeConsultationLabel={t("propose_consultation_label")}
              handleSuggestConsultation={handleSuggestConsultation}
              noConsultationHeading={t("no_consultation_selected")}
            />
          )}
        </div>
      ) : null}
    </Block>
  );
};

const ConsultationDetails = ({
  consultationId,
  handleGoBack,
  screenWidth,
  proposeConsultationLabel,
  handleSuggestConsultation,
  noConsultationHeading,
}) => {
  const renderAllMessages = () => {
    return consultationsMessages.map((message, index) => {
      if (message.type === "system-message") {
        return (
          <SystemMessage
            title={message.message}
            date={message.date}
            key={index}
          />
        );
      } else {
        if (message.senderId === id) {
          return (
            <Message
              message={message.message}
              sent
              date={message.date}
              key={index}
            />
          );
        } else {
          return (
            <Message
              message={message.message}
              received
              date={message.date}
              key={index}
            />
          );
        }
      }
    });
  };

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
  //TODO: get id from user
  const id = "1";

  return (
    <div className="clients__consultation-container">
      {!consultationId ? (
        <div className="clients__consultation-container__no-selected">
          <img src={mascot} alt="Mascot" className="mascot" />
          <h4 className="clients__consultation-container__no-selected__text">
            {noConsultationHeading}
          </h4>
        </div>
      ) : (
        <div className="clients__consultation-container__consultation">
          {screenWidth < 1366 && (
            <div className="clients__consultation-container__consultation__header">
              <Icon
                name="arrow-chevron-back"
                onClick={handleGoBack}
                color="#20809E"
              />
            </div>
          )}
          <div className="clients__consultation-container__consultation__messages">
            {renderAllMessages()}
          </div>
          <Button
            size="lg"
            label={proposeConsultationLabel}
            onClick={handleSuggestConsultation}
            classes="clients__consultation-container__consultation__button"
          />
        </div>
      )}
    </div>
  );
};
const ConsultationsHistory = ({
  handleConsultationClick,
  clientName,
  image,
  proposeConsultationLabel,
  daysOfWeekTranslations,
  selectedClient,
}) => {
  const imageUrl = AMAZON_S3_BUCKET + "/" + (image || "default");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const consultationsQuery = useGetPastConsultationsByClientId(
    selectedClient.clientDetailId
  );

  const renderAllConsultations = () => {
    if (consultationsQuery.isLoading)
      return (
        <GridItem md={8} lg={12} classes="clients__consultation-loading">
          <Loading size="lg" />
        </GridItem>
      );
    return consultationsQuery.data?.map((consultation, index) => {
      return (
        <GridItem key={index} md={8} lg={12}>
          <Consultation
            overview={true}
            consultation={consultation}
            daysOfWeekTranslations={daysOfWeekTranslations}
            renderIn="client"
            onClick={() => handleConsultationClick(consultation.consultationId)}
          />
        </GridItem>
      );
    });
  };

  const renderMenuOptions = () => {
    let menuOptions = [];

    if (true) {
      menuOptions.push({
        iconName: "close-x",
        text: proposeConsultationLabel,
        onClick: () => handleCancelConsultation(),
      });
    }

    return menuOptions.map((option, index) => {
      return (
        <div
          className="client-history__menu__option"
          onClick={option.onClick}
          key={index}
        >
          <Icon
            name={option.iconName}
            color={"#373737"}
            classes="client-history__menu__option__icon"
          />
          <p className="small-text">{option.text}</p>
        </div>
      );
    });
  };

  return (
    <div className="clients__main-container">
      <Box classes="clients__main-container__header">
        <div className="clients__main-container__header__client-container">
          <Avatar image={imageUrl} size="sm" />
          <p className="name-text">{clientName}</p>
        </div>
        <Icon
          name="three-dots-vertical"
          color="#20809E"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
      </Box>
      <Grid classes="clients__main-container__grid">
        {renderAllConsultations()}
      </Grid>
      {isMenuOpen && (
        <OutsideClickHandler onOutsideClick={() => setIsMenuOpen(false)}>
          <div className="clients__main-container__menu">
            {renderMenuOptions()}
          </div>
        </OutsideClickHandler>
      )}
    </div>
  );
};
