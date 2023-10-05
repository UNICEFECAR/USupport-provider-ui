import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

import { InputSearch } from "@USupport-components-library/src";
import { userSvc } from "@USupport-components-library/services";
import { useWindowDimensions } from "@USupport-components-library/utils";

import { Page, Clients as ClientsBlock } from "#blocks";
import {
  CancelConsultation,
  SelectConsultation,
  JoinConsultation,
} from "#backdrops";
import { useBlockSlot, useSuggestConsultation } from "#hooks";

import "./clients.scss";

/**
 * Clients
 *
 * Clients page
 *
 * @returns {JSX.Element}
 */
export const Clients = () => {
  const { width } = useWindowDimensions();
  const { t } = useTranslation("clients-page");
  const providerId = userSvc.getUserID();

  const [selectedClientId, setSelectedClientId] = useState();
  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const [isSelectConsultationOpen, setIsSelectConsultationOpen] =
    useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [blockSlotError, setBlockSlotError] = useState();
  const [isBlockSlotSubmitting, setIsBlockSlotSubmitting] = useState(false);

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);

  const location = useLocation();
  const initiallySelectedClient = location.state?.clientInformation || null;
  const [selectedClient, setSelectedClient] = useState(initiallySelectedClient);

  const initiallySelectedConsultation =
    location.state?.consultationInformation || null;

  const [displayedConsultation, setDisplayedConsultation] = useState();

  useEffect(() => {
    if (selectedClient || displayedConsultation) {
      window.scrollTo(0, 0);
    }
  }, [selectedClient, displayedConsultation]);

  useEffect(() => {
    if (!initiallySelectedConsultation) {
      setDisplayedConsultation(null);
    } else {
      setDisplayedConsultation(initiallySelectedConsultation);
    }
  }, [selectedClient, initiallySelectedConsultation]);

  const openJoinConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setIsJoinConsultationOpen(true);
  };

  const closeSelectConsultation = () => setIsSelectConsultationOpen(false);

  const openSelectConsultation = (clientId) => {
    setSelectedClientId(clientId);
    setIsSelectConsultationOpen(true);
  };

  const openCancelConsultation = (consultation) => {
    setIsCancelConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  const onSuggestConsultationSuccess = () => {
    toast(t("consultation_suggest_success"));
    setIsBlockSlotSubmitting(false);
    window.dispatchEvent(new Event("new-notification"));
    closeSelectConsultation();
    setBlockSlotError(null);
  };
  const onSuggestConsultationError = (error) => {
    setBlockSlotError(error);
    setIsBlockSlotSubmitting(false);
  };
  const suggestConsultationMutation = useSuggestConsultation(
    onSuggestConsultationSuccess,
    onSuggestConsultationError
  );

  const onBlockSlotSuccess = (consultationId) => {
    suggestConsultationMutation.mutate(consultationId);
    setIsBlockSlotSubmitting(false);
  };
  const onBlockSlotError = (error) => {
    setBlockSlotError(error);
    setIsBlockSlotSubmitting(false);
  };
  const blockSlotMutation = useBlockSlot(onBlockSlotSuccess, onBlockSlotError);
  const handleBlockSlot = (slot) => {
    setIsBlockSlotSubmitting(true);
    blockSlotMutation.mutate({
      slot,
      clientId: selectedClientId,
    });
  };

  return (
    <Page
      classes="page__clients"
      showNavbar
      showFooter
      showGoBackArrow={selectedClient}
      handleGoBack={() => {
        if (width < 1366 && displayedConsultation) {
          setDisplayedConsultation(null);
        } else {
          setSelectedClient(null);
        }
      }}
      heading={t("heading")}
      headingButton={
        !selectedClient ? (
          <InputSearch
            placeholder={t("input_search_placeholder")}
            onChange={(value) => setSearchValue(value)}
            value={searchValue}
          />
        ) : null
      }
    >
      <ClientsBlock
        openCancelConsultation={openCancelConsultation}
        openSelectConsultation={openSelectConsultation}
        openJoinConsultation={openJoinConsultation}
        searchValue={searchValue}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        initiallySelectedConsultation={initiallySelectedConsultation}
        selectedConsultation={displayedConsultation}
        setSelectedConsultation={setDisplayedConsultation}
      />
      {selectedConsultation && (
        <>
          <CancelConsultation
            isOpen={isCancelConsultationOpen}
            onClose={closeCancelConsultation}
            consultation={selectedConsultation}
          />
        </>
      )}
      <SelectConsultation
        isOpen={isSelectConsultationOpen}
        onClose={closeSelectConsultation}
        providerId={providerId}
        clientId={selectedClientId}
        handleBlockSlot={handleBlockSlot}
        errorMessage={blockSlotError}
        isCtaDisabled={isBlockSlotSubmitting}
      />
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={() => setIsJoinConsultationOpen(false)}
        consultation={selectedConsultation}
      />
    </Page>
  );
};
