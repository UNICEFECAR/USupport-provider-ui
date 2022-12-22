import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Backdrop,
  ConsultationInformation,
} from "@USupport-components-library/src";
import { useCancelConsultation } from "#hooks";

import { ONE_HOUR } from "@USupport-components-library/utils";

import "./cancel-consultation.scss";

/**
 * CancelConsultation
 *
 * The CancelConsultation backdrop
 *
 * @return {jsx}
 */
export const CancelConsultation = ({
  isOpen,
  onClose,
  consultation,
  onSuccess = () => {},
  provider,
}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("cancel-consultation");
  const [error, setError] = useState();

  const { clientName, timestamp, time, image } = consultation;

  const startDate = new Date(time || timestamp);
  const endDate = new Date(new Date(time || timestamp).getTime() + ONE_HOUR);
  const onCancelSuccess = () => {
    onSuccess();
    queryClient.invalidateQueries({ queryKey: ["all-consultations"] });
    queryClient.invalidateQueries({ queryKey: ["consultations-single-week"] });
    onClose();
    toast(t("cancel_success"));
  };
  const onCancelError = (error) => {
    setError(error);
  };
  const cancelConsultationMutation = useCancelConsultation(
    onCancelSuccess,
    onCancelError
  );

  const handleCancelClick = () => {
    cancelConsultationMutation.mutate(consultation.consultationId);
  };

  return (
    <Backdrop
      classes="cancel-consultation"
      title="CancelConsultation"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      ctaLabel={t("cancel_button_label")}
      ctaHandleClick={handleCancelClick}
      secondaryCtaLabel={t("keep_button_label")}
      secondaryCtaHandleClick={onClose}
      errorMessage={error}
    >
      <ConsultationInformation
        startDate={startDate}
        endDate={endDate}
        providerName={clientName}
        providerImage={image || "default"}
        classes="cancel-consultation__provider-consultation"
        t={t}
      />
    </Backdrop>
  );
};
