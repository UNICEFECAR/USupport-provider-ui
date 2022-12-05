import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import OutsideClickHandler from "react-outside-click-handler";
import { useLocation, useNavigate } from "react-router-dom";

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
import { useWindowDimensions } from "@USupport-components-library/src/utils";

import {
  useGetAllClients,
  useGetPastConsultationsByClientId,
  useGetChatData,
} from "#hooks";

import "./clients.scss";

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

  const location = useLocation();
  const initiallySelectedClient = location.state?.clientInformation || null;
  const [selectedClient, setSelectedClient] = useState(initiallySelectedClient);

  const initiallySelectedConsultation =
    location.state?.consultationInformation || null;
  const [selectedConsultation, setSelectedConsultation] = useState(
    initiallySelectedConsultation
  );

  const clientsQuery = useGetAllClients();

  const handleConsultationClick = (consultation) => {
    setSelectedConsultation(consultation);
  };

  const handleCancelConsultation = (consultation) => {
    openCancelConsultation(consultation);
  };

  const handleSuggestConsultation = (clientId) => {
    openSelectConsultation(clientId);
  };

  const renderAllClients = () => {
    return clientsQuery.data?.map((client, index) => {
      return (
        <GridItem lg={6} key={index}>
          <ClientHistory
            cancelConsultation={handleCancelConsultation}
            clientId={client.clientDetailId}
            handleClick={() => setSelectedClient(client)}
            image={client.image}
            name={client.name}
            nextConsultationId={client.nextConsultationId}
            pastConsultations={client.pastConsultations}
            suggestConsultation={handleSuggestConsultation}
            suggested={client.nextConsultationStatus === "suggested"}
            t={t}
            timestamp={client.nextConsultation}
          />
        </GridItem>
      );
    });
  };

  return (
    <Block classes="clients">
      {selectedClient ? (
        <div className="clients__go-back-arrow-container">
          <Icon
            onClick={() => {
              if (selectedConsultation) {
                setSelectedConsultation("");
              } else {
                setSelectedClient(null);
              }
            }}
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
        <Grid classes="clients__content">
          {((width < 1366 && !selectedConsultation) || width >= 1366) && (
            <ConsultationsHistory
              clientName={selectedClient.name}
              handleConsultationClick={handleConsultationClick}
              handleSuggestConsultation={handleSuggestConsultation}
              image={selectedClient.image}
              proposeConsultationLabel={t("propose_consultation_label")}
              selectedClient={selectedClient}
              screenWidth={width}
              t={t}
            />
          )}
          {((width < 1366 && selectedConsultation) || width >= 1366) && (
            <ConsultationDetails
              consultation={selectedConsultation}
              handleGoBack={() => setSelectedConsultation("")}
              handleSuggestConsultation={handleSuggestConsultation}
              noConsultationHeading={t("no_consultation_selected")}
              proposeConsultationLabel={t("propose_consultation_label")}
              selectedClient={selectedClient}
              t={t}
            />
          )}
        </Grid>
      ) : null}
    </Block>
  );
};

const ConsultationDetails = ({
  consultation,
  proposeConsultationLabel,
  handleSuggestConsultation,
  noConsultationHeading,
  selectedClient,
  t,
}) => {
  const chatQuery = useGetChatData(consultation?.chatId);

  const renderAllMessages = () => {
    if (chatQuery.data.messages.length === 0) return <p>{t("no_messages")}</p>;
    return [
      ...chatQuery.data.messages,
      ...chatQuery.data.messages,
      ...chatQuery.data.messages,
    ].map((message, index) => {
      if (message.type === "system-message") {
        return (
          <SystemMessage
            message={message.content}
            date={new Date(message.date)}
            key={index}
          />
        );
      } else {
        if (message.senderId === chatQuery.data.providerDetailId) {
          return (
            <Message
              message={message.content}
              date={new Date(message.date)}
              sent
              key={index}
            />
          );
        } else {
          return (
            <Message
              message={message.content}
              date={new Date(message.date)}
              received
              key={index}
            />
          );
        }
      }
    });
  };

  return (
    <GridItem md={8} lg={8} classes="clients__consultation-container">
      {!consultation ? (
        <div className="clients__consultation-container__no-selected">
          <img src={mascot} alt="Mascot" className="mascot" />
          <h4 className="clients__consultation-container__no-selected__text">
            {noConsultationHeading}
          </h4>
        </div>
      ) : (
        <div className="clients__consultation-container__consultation">
          {/* {screenWidth < 1366 && (
            <div className="clients__consultation-container__consultation__header">
              <Icon
                name="arrow-chevron-back"
                onClick={handleGoBack}
                color="#20809E"
              />
            </div>
          )} */}
          <div className="clients__consultation-container__consultation__messages">
            {chatQuery.isLoading ? <Loading size="lg" /> : renderAllMessages()}
          </div>
          <div>
            <Button
              size="lg"
              label={proposeConsultationLabel}
              onClick={() =>
                handleSuggestConsultation(selectedClient.clientDetailId)
              }
              classes="clients__consultation-container__consultation__button"
            />
          </div>
        </div>
      )}
    </GridItem>
  );
};

const ConsultationsHistory = ({
  handleConsultationClick,
  clientName,
  image,
  proposeConsultationLabel,
  selectedClient,
  handleSuggestConsultation,
  t,
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
    if (consultationsQuery.data.length === 0)
      return (
        <GridItem md={8} lg={12} classes="clients__no-consultations">
          <h4>{t("no_consultations")}</h4>
        </GridItem>
      );
    return consultationsQuery.data?.map((consultation, index) => {
      return (
        <GridItem key={index} md={8} lg={12}>
          <Consultation
            overview={true}
            consultation={consultation}
            renderIn="client"
            onClick={() => handleConsultationClick(consultation)}
            t={t}
          />
        </GridItem>
      );
    });
  };

  const renderMenuOptions = () => {
    const menuOptions = [
      {
        iconName: "share-front",
        text: proposeConsultationLabel,
        onClick: () => handleSuggestConsultation(selectedClient.clientDetailId),
      },
    ];

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
    <GridItem md={8} lg={4} classes="clients__main-container">
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
    </GridItem>
  );
};
