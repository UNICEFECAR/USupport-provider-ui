import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import OutsideClickHandler from "react-outside-click-handler";

import {
  Block,
  Button,
  ClientHistory,
  Consultation,
  Grid,
  GridItem,
  Icon,
  Loading,
  Message,
  SystemMessage,
} from "@USupport-components-library/src";

import { mascotHappyPurpleFull as mascot } from "@USupport-components-library/assets";

import {
  useWindowDimensions,
  systemMessageTypes,
} from "@USupport-components-library/src/utils";

import {
  useGetAllClients,
  useGetPastConsultationsByClientId,
  useGetChatData,
  useGetProviderData,
} from "#hooks";

import "./clients.scss";

/**
 * Clients
 *
 * Clients block
 *
 * @return {jsx}
 */
export const Clients = ({
  openCancelConsultation,
  openSelectConsultation,
  openJoinConsultation,
  searchValue,
  selectedClient,
  setSelectedClient,
  selectedConsultation,
  setSelectedConsultation,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "clients" });
  const { width } = useWindowDimensions();

  const clientsQuery = useGetAllClients();

  const providerQuery = useGetProviderData()[0];
  const providerStatus = providerQuery?.data?.status;

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
    let clientsData = clientsQuery.data;
    const value = searchValue?.toLowerCase();
    if (value) {
      clientsData = clientsQuery.data?.filter((client) => {
        return client.name.toLowerCase().includes(value);
      });
    }

    if (value && clientsData.length === 0)
      return (
        <GridItem md={8} lg={12} classes="clients__no-clients-item">
          {t("no_clients_search")}
        </GridItem>
      );
    if (!clientsData || clientsData.length === 0)
      return (
        <GridItem md={8} lg={12} classes="clients__no-clients-item">
          {t("no_clients")}
        </GridItem>
      );

    return clientsData?.map((client, index) => {
      return (
        <GridItem lg={6} key={index}>
          <ClientHistory
            cancelConsultation={handleCancelConsultation}
            clientId={client.clientDetailId}
            joinConsultation={openJoinConsultation}
            consultationChatId={client.chatId}
            handleClick={() => {
              setSelectedClient(client);
            }}
            image={client.image}
            name={client.name}
            nextConsultationId={client.nextConsultationId}
            nextConsultationPrice={client.nextConsultationPrice}
            nextConsultationCouponPrice={client.nextConsultationCouponPrice}
            nextConsultationCampaignId={client.nextConsultationCampaignId}
            nextConsultationSponsorName={client.nextConsultationSponsorName}
            consultationPrice={client.nextConsultationPrice}
            consultationCouponPrice={client.nextConsultationCouponPrice}
            pastConsultations={client.pastConsultations}
            suggestConsultation={handleSuggestConsultation}
            suggested={client.nextConsultationStatus === "suggested"}
            t={t}
            timestamp={client.nextConsultation}
            providerStatus={providerStatus}
          />
        </GridItem>
      );
    });
  };

  return (
    <Block classes="clients">
      {!selectedClient ? (
        <div className="clients__clients-container">
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
              setSelectedConsultation={setSelectedConsultation}
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
              providerStatus={providerStatus}
              setSelectedConsultation={setSelectedConsultation}
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
  providerStatus,
  t,
}) => {
  const chatQuery = useGetChatData(consultation?.chatId);

  // useEffect(() => {
  //   return () => setSelectedConsultation(null);
  // }, []);

  const renderAllMessages = () => {
    if (chatQuery.data.messages.length === 0) return <p>{t("no_messages")}</p>;
    return chatQuery.data.messages.map((message, index) => {
      if (message.type === "system") {
        return (
          <SystemMessage
            title={
              systemMessageTypes.includes(message.content)
                ? t(message.content)
                : message.content
            }
            date={new Date(Number(message.time))}
            key={index}
          />
        );
      } else {
        if (message.senderId === chatQuery.data.providerDetailId) {
          return (
            <Message
              message={message.content}
              date={new Date(Number(message.time))}
              sent
              key={index}
            />
          );
        } else {
          return (
            <Message
              message={message.content}
              date={new Date(Number(message.time))}
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

          {providerStatus === "active" ? (
            <Button
              size="lg"
              label={proposeConsultationLabel}
              onClick={() =>
                handleSuggestConsultation(selectedClient.clientDetailId)
              }
              classes="clients__consultation-container__consultation__button"
            />
          ) : null}
        </div>
      )}
    </GridItem>
  );
};

const ConsultationsHistory = ({
  handleConsultationClick,
  proposeConsultationLabel,
  selectedClient,
  handleSuggestConsultation,
  setSelectedConsultation,
  screenWidth,
  t,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (screenWidth >= 1366) setSelectedConsultation(null);
    };
  }, []);

  const consultationsQuery = useGetPastConsultationsByClientId(
    selectedClient.clientDetailId
  );

  const renderAllConsultations = () => {
    if (consultationsQuery.isFetching)
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
            sponsorImage={consultation.sponsorImage}
            renderIn="provider"
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
