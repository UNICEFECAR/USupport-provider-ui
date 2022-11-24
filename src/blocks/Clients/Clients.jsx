import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import OutsideClickHandler from "react-outside-click-handler";
import {
  Block,
  InputSearch,
  Grid,
  GridItem,
  ClientHistory,
  Consultation,
  Icon,
  SystemMessage,
  Message,
  Button,
  Avatar,
  Box,
} from "@USupport-components-library/src";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { mascotHappyPurpleFull as mascot } from "@USupport-components-library/assets";

import "./clients.scss";

/**
 * Clients
 *
 * Clients block
 *
 * @return {jsx}
 */
export const Clients = ({}) => {
  const { t } = useTranslation("clients");

  const { width } = useWindowDimensions();

  const [selectedClientId, setSelectedClientId] = useState(null);

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

  const fetchClients = async () => {};
  const clientsQuery = useQuery(["clients"], fetchClients, {
    enabled: false, // TODO: Enable this when the API is ready and remove the placeholder data
    placeholderData: [1, 2, 3].map((x) => {
      if (x === 1) {
        return {
          name: "Dr. Joanna Doe" + x.toString(),
          nextConsultation: 1669301797000,
          pastConsultations: 5,
        };
      } else if (x === 2) {
        return {
          name: "Dr. Joanna Doe",
          nextConsultation: 1749154966251,
          pastConsultations: 5,
        };
      } else if (x === 3) {
        return {
          name: "Dr. Joanna Doe",
          nextConsultation: null,
          pastConsultations: 5,
        };
      } else {
        return {
          name: "Dr. Joanna Doe",
          pastConsultations: 5,
        };
      }
    }),
  });

  const handleProposeConsultation = () => {
    console.log("Propose consultation");
  };

  const handleConsultationClick = (id) => {
    setSelectedConsultationId(id);
  };

  const renderAllClients = () => {
    return clientsQuery.data.map((client, index) => {
      return (
        <GridItem lg={6} key={index}>
          <ClientHistory
            name={client.name}
            timestamp={client.nextConsultation}
            pastConsultations={client.pastConsultations}
            handleClick={() => setSelectedClientId(index)}
            daysOfWeekTranslations={daysOfWeekTranslations}
          />
        </GridItem>
      );
    });
  };

  return (
    <Block classes="clients">
      {selectedClientId && !selectedConsultationId && (
        <Icon
          onClick={() => setSelectedClientId(null)}
          classes="clients__go-back-icon"
          name="arrow-chevron-back"
          color="#20809E"
        />
      )}
      {!selectedClientId && (
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
      )}
      {selectedClientId && (
        <div className="clients__content">
          {((width < 1366 && !selectedConsultationId) || width >= 1366) && (
            <ConsultationsHistory
              clientName={clientsQuery.data[selectedClientId].name}
              handleConsultationClick={handleConsultationClick}
              proposeConsultationLabel={t("propose_consultation_label")}
              daysOfWeekTranslations={daysOfWeekTranslations}
            />
          )}
          {((width < 1366 && selectedConsultationId) || width >= 1366) && (
            <ConsultationDetails
              consultationId={selectedConsultationId}
              handleGoBack={() => setSelectedConsultationId("")}
              screenWidth={width}
              proposeConsultationLabel={t("propose_consultation_label")}
              handleProposeConsultation={handleProposeConsultation}
              noConsultationHeading={t("no_consultation_selected")}
            />
          )}
        </div>
      )}
    </Block>
  );
};

const ConsultationDetails = ({
  consultationId,
  handleGoBack,
  screenWidth,
  proposeConsultationLabel,
  handleProposeConsultation,
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
            onClick={handleProposeConsultation}
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
  proposeConsultationLabel,
  daysOfWeekTranslations,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchConsultations = async () => {};
  const consultationsQuery = useQuery(["consultations"], fetchConsultations, {
    enabled: false, // TODO: Enable this when the API is ready and remove the placeholder data
    placeholderData: [1, 2, 3, 4, 5, 6, 7, 8].map((x) => {
      return {
        id: x,
        name: "Joanna Doe " + x.toString(),
        timestamp: 1669154966251 + 3600000 * x,
        overview: true,
      };
    }),
  });

  const renderAllConsultations = () => {
    return consultationsQuery.data.map((consultation, index) => {
      return (
        <GridItem key={index} md={8} lg={12}>
          <Consultation
            name={consultation.name}
            timestamp={consultation.timestamp}
            overview={consultation.overview}
            daysOfWeekTranslations={daysOfWeekTranslations}
            renderIn="client"
            onClick={() => handleConsultationClick(consultation.id)}
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
          <Avatar size="sm" />
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
