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
}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("cancel-consultation");
  const [error, setError] = useState();

  const { clientName, timestamp, time, image } = consultation;

  const startDate = new Date(time || timestamp);
  const endDate = new Date(new Date(time || timestamp).getTime() + ONE_HOUR);

  const isConsultationLessThan24HoursBefore =
    new Date().getTime() + 24 * ONE_HOUR >= startDate.getTime();

  const onCancelSuccess = () => {
    onSuccess();
    queryClient.invalidateQueries({ queryKey: ["upcoming-consultations"] });
    queryClient.invalidateQueries({ queryKey: ["consultations-single-day"] });
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
    cancelConsultationMutation.mutate({
      consultationId: consultation.consultationId,
      price: consultation.price,
      shouldRefund: isConsultationLessThan24HoursBefore ? false : true,
    });
  };

  return (
    <Backdrop
      classes="cancel-consultation"
      title="CancelConsultation"
      isOpen={isOpen}
      onClose={onClose}
      heading={
        consultation.price > 0
          ? t("paid_heading", { price: consultation.price })
          : t("heading")
      }
      text={consultation.price > 0 ? t("paid_subheading") : ""}
      ctaHandleClick={onClose}
      ctaLabel={t("keep_button_label")}
      secondaryCtaLabel={t("cancel_button_label")}
      secondaryCtaHandleClick={handleCancelClick}
      secondaryCtaColor={consultation.price > 0 ? "red" : "green"}
      showLoadingIfDisabled
      isSecondaryCtaDisabled={cancelConsultationMutation.isLoading}
      errorMessage={error}
    >
      <div className="cancel-consultation__content-container">
        <ConsultationInformation
          startDate={startDate}
          endDate={endDate}
          providerName={clientName}
          providerImage={image || "default"}
          classes="cancel-consultation__provider-consultation"
          t={t}
        />
        <div
          className={[
            "cancel-consultation__price-badge",
            //TODO: refactor if price === 0, then free
            1 !== 1 && "cancel-consultation__price-badge--free",
          ].join(" ")}
        >
          {/* TODO: refactor to show the real price */}
          <p className="small-text">{consultation.price}</p>
        </div>
      </div>
    </Backdrop>
  );
};
