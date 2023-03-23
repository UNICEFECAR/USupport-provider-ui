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
  couponPrice,
  onSuccess = () => {},
}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("cancel-consultation");
  const [error, setError] = useState();
  const currencySymbol = localStorage.getItem("currency_symbol");

  const {
    clientName,
    timestamp,
    time,
    image,
    price: consultationPrice,
    couponPrice: consultationCouponPrice,
  } = consultation;

  const price = !isNaN(couponPrice)
    ? couponPrice
    : !isNaN(consultationCouponPrice)
    ? consultationCouponPrice
    : consultationPrice;

  const startDate = new Date(time || timestamp);
  const endDate = new Date(new Date(time || timestamp).getTime() + ONE_HOUR);

  const isConsultationLessThan24HoursBefore =
    new Date().getTime() + 24 * ONE_HOUR >= startDate.getTime();

  const onCancelSuccess = () => {
    onSuccess();
    queryClient.invalidateQueries({ queryKey: ["upcoming-consultations"] });
    queryClient.invalidateQueries({ queryKey: ["consultations-single-day"] });
    queryClient.invalidateQueries({ queryKey: ["campaign-consultations"] });
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

  // Should refund only when the consultation is more than 24 hours from now
  // and there is no coupon price
  const shouldRefund =
    isConsultationLessThan24HoursBefore || consultation.campaignId
      ? false
      : true;

  const handleCancelClick = () => {
    cancelConsultationMutation.mutate({
      consultationId: consultation.consultationId,
      price,
      shouldRefund,
    });
  };

  return (
    <Backdrop
      classes="cancel-consultation"
      title="CancelConsultation"
      isOpen={isOpen}
      onClose={onClose}
      heading={price > 0 ? t("paid_heading", { price }) : t("heading")}
      text={
        price > 0 && !couponPrice && !consultationCouponPrice
          ? t("paid_subheading")
          : ""
      }
      ctaHandleClick={onClose}
      ctaLabel={t("keep_button_label")}
      secondaryCtaLabel={t("cancel_button_label")}
      secondaryCtaHandleClick={handleCancelClick}
      secondaryCtaColor={price > 0 ? "red" : "green"}
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
            !price && "cancel-consultation__price-badge--free",
          ].join(" ")}
        >
          <p className="small-text">
            {price}
            {currencySymbol}
          </p>
        </div>
      </div>
    </Backdrop>
  );
};
