import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import OutsideClickHandler from "react-outside-click-handler";

import {
  Avatar,
  Block,
  Box,
  ClientHistory,
  Consultation,
  Grid,
  GridItem,
  Icon,
  InputSearch,
  Loading,
  Message,
  NewButton,
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

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

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
  setSearchValue,
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
    <Block classes="clients clients--v1">
      {!selectedClient ? (
        <div className="clients__clients-container">
          <Box classes="clients__list-panel">
              <div className="clients__list-panel__search">
                <InputSearch
                  placeholder={t("input_search_placeholder")}
                  onChange={(value) => setSearchValue(value)}
                  value={searchValue}
                />
              </div>
              <Grid classes="clients__list-panel__grid">
                {renderAllClients()}
              </Grid>
          </Box>
        </div>
      ) : null}
      {selectedClient ? (
        <div className="clients__content">
          {((width < 1366 && !selectedConsultation) || width >= 1366) && (
            <Box classes="clients__main-container">
              <ConsultationsHistory
                handleConsultationClick={handleConsultationClick}
                selectedClient={selectedClient}
                setSelectedConsultation={setSelectedConsultation}
                screenWidth={width}
                t={t}
              />
            </Box>
          )}
          {((width < 1366 && selectedConsultation) || width >= 1366) && (
            <Box classes="clients__consultation-container">
              <ConsultationDetails
                consultation={selectedConsultation}
                handleGoBack={() => setSelectedConsultation("")}
                handleSuggestConsultation={handleSuggestConsultation}
                noConsultationHeading={t("no_consultation_selected")}
                proposeConsultationLabel={t("propose_consultation_label")}
                selectedClient={selectedClient}
                providerStatus={providerStatus}
                screenWidth={width}
                t={t}
              />
            </Box>
          )}
        </div>
      ) : null}
    </Block>
  );
};

const ConsultationDetails = ({
  consultation,
  proposeConsultationLabel,
  handleGoBack,
  handleSuggestConsultation,
  noConsultationHeading,
  selectedClient,
  providerStatus,
  screenWidth,
  t,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const chatQuery = useGetChatData(consultation?.chatId);

  const selectedClientImage =
    AMAZON_S3_BUCKET + "/" + (selectedClient?.image || "default");

  const handleProposeConsultation = () => {
    setIsMenuOpen(false);
    handleSuggestConsultation(selectedClient.clientDetailId);
  };

  const renderMenuOptions = () => {
    const menuOptions = [
      {
        iconName: "share-front",
        text: proposeConsultationLabel,
        onClick: handleProposeConsultation,
      },
    ];

    return menuOptions.map((option, index) => {
      return (
        <div
          className="menu-option"
          onClick={option.onClick}
          key={index}
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
    <>
      {!consultation ? (
        <div className="clients__consultation-container__no-selected">
          <img src={mascot} alt="Mascot" className="mascot" />
          <h4 className="clients__consultation-container__no-selected__text">
            {noConsultationHeading}
          </h4>
        </div>
      ) : (
        <div className="clients__consultation-container__consultation">
          <div className="clients__consultation-container__consultation__header">
            <Box
              liquidGlass
              classes="clients__consultation-container__consultation__header__client-container"
            >
              <div className="clients__consultation-container__consultation__header__client-container__identity">
                {screenWidth < 1366 && (
                  <Icon
                    name="arrow-chevron-back"
                    color="#20809E"
                    onClick={handleGoBack}
                  />
                )}
                <Avatar size="sm" image={selectedClientImage} />
                <h4 className="client-name">{selectedClient.name}</h4>
              </div>
              <Icon
                name="three-dots-vertical"
                color="#20809E"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </Box>
          </div>
          <div className="clients__consultation-container__consultation__messages">
            {chatQuery.isLoading ? <Loading size="lg" /> : renderAllMessages()}
          </div>

          {providerStatus === "active" ? (
            <NewButton
              type="gradient"
              size="lg"
              iconName="share-front"
              label={proposeConsultationLabel}
              onClick={handleProposeConsultation}
              classes="clients__consultation-container__consultation__button"
            />
          ) : null}
          {isMenuOpen && (
            <OutsideClickHandler onOutsideClick={() => setIsMenuOpen(false)}>
              <div className="clients__consultation-container__consultation__menu">
                {renderMenuOptions()}
              </div>
            </OutsideClickHandler>
          )}
        </div>
      )}
    </>
  );
};

const ConsultationsHistory = ({
  handleConsultationClick,
  selectedClient,
  setSelectedConsultation,
  screenWidth,
  t,
}) => {
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

  return (
    <Grid classes="clients__main-container__grid">
      {renderAllConsultations()}
    </Grid>
  );
};
