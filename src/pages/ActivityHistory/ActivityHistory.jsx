import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { Page, ActivityHistory as ActivityHistoryBlock } from "#blocks";
import { SelectConsultation } from "#backdrops";
import { useBlockSlot, useSuggestConsultation } from "#hooks";
import { userSvc } from "@USupport-components-library/services";

import "./activity-history.scss";

/**
 * ActivityHistory
 *
 * ActivityHistory page
 *
 * @returns {JSX.Element}
 */
export const ActivityHistory = () => {
  const { t } = useTranslation("activity-history-page");
  const location = useLocation();

  const preselectedConsultation = location.state?.consultation;

  const [selectedClientId, setSelectedClientId] = useState();
  const [isSelectConsultationOpen, setIsSelectConsultationOpen] =
    useState(false);

  const [blockSlotError, setBlockSlotError] = useState();
  const [isBlockSlotSubmitting, setIsBlockSlotSubmitting] = useState(false);

  const closeSelectConsultation = () => setIsSelectConsultationOpen(false);

  const providerId = userSvc.getUserID();

  const openSelectConsultation = (clientId) => {
    setSelectedClientId(clientId);
    setIsSelectConsultationOpen(true);
  };

  const onSuggestConsultationSuccess = (data) => {
    toast(t("consultation_suggest_success"));
    setIsBlockSlotSubmitting(false);
    // setConsultationId(consultationId);
    closeSelectConsultation();
    openConfirmConsultationBackdrop();
    setBlockSlotError(null);
    window.dispatchEvent(new Event("new-notification"));
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
    <Page
      classes="page__activity-history"
      showNavbar
      showFooter
      showGoBackArrow={false}
      heading={t("heading")}
    >
      <ActivityHistoryBlock
        openSelectConsultation={openSelectConsultation}
        preselectedConsultation={preselectedConsultation}
      />
      <SelectConsultation
        isOpen={isSelectConsultationOpen}
        onClose={() => setIsSelectConsultationOpen(false)}
        providerId={providerId}
        clientId={selectedClientId}
        handleBlockSlot={handleBlockSlot}
        errorMessage={blockSlotError}
        isCtaDisabled={isBlockSlotSubmitting}
      />
    </Page>
  );
};
