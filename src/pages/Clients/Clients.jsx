import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { userSvc } from "@USupport-components-library/services";
import { Page, Clients as ClientsBlock } from "#blocks";
import { CancelConsultation, SelectConsultation } from "#backdrops";
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
  const { t } = useTranslation("clients-page");
  const providerId = userSvc.getUserID();

  const [selectedClientId, setSelectedClientId] = useState();
  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const [isSelectConsultationOpen, setIsSelectConsultationOpen] =
    useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState();

  const [blockSlotError, setBlockSlotError] = useState();
  const [isBlockSlotSubmitting, setIsBlockSlotSubmitting] = useState(false);

  const closeSelectConsultation = () => setIsSelectConsultationOpen(false);

  const openSelectConsultation = (clientId) => {
    // setSelectedConsultation(consultation);
    setSelectedClientId(clientId);
    setIsSelectConsultationOpen(true);
  };

  const openCancelConsultation = (consultation) => {
    setIsCancelConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  const onSuggestConsultationSuccess = (data) => {
    toast(t("consultation_suggest_success"));
    setIsBlockSlotSubmitting(false);
    // setConsultationId(consultationId);
    closeSelectConsultation();
    openConfirmConsultationBackdrop();
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
    // setIsBlockSlotSubmitting(false);
    // setConsultationId(consultationId);

    suggestConsultationMutation.mutate(consultationId);
    setIsBlockSlotSubmitting(false);
    // closeSelectConsultation();
    // openConfirmConsultationBackdrop();
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
    <Page classes="page__clients" showNavbar showFooter showGoBackArrow={false}>
      <ClientsBlock
        openCancelConsultation={openCancelConsultation}
        openSelectConsultation={openSelectConsultation}
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
    </Page>
  );
};
