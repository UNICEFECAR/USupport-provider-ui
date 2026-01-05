import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Backdrop,
  ConsultationInformation,
  Button,
} from "@USupport-components-library/src";
import { userSvc } from "@USupport-components-library/services";
import {
  useCancelConsultation,
  useBlockSlot,
  useSuggestConsultation,
} from "#hooks";
import { SelectConsultation } from "#backdrops";

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
  const { t } = useTranslation("modals", { keyPrefix: "cancel-consultation" });
  const [error, setError] = useState();
  const [isSelectConsultationOpen, setIsSelectConsultationOpen] =
    useState(false);
  const [blockSlotError, setBlockSlotError] = useState();
  const [isBlockSlotSubmitting, setIsBlockSlotSubmitting] = useState(false);
  const currencySymbol = localStorage.getItem("currency_symbol");
  const providerId = userSvc.getUserID();

  const {
    clientName,
    clientDetailId,
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

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["upcoming-consultations"] });
    queryClient.invalidateQueries({ queryKey: ["consultations-single-day"] });
    queryClient.invalidateQueries({ queryKey: ["campaign-consultations"] });
    queryClient.invalidateQueries({ queryKey: ["all-clients"] });
    queryClient.invalidateQueries({ queryKey: ["calendar-data"] });
  };

  const onCancelSuccess = () => {
    onSuccess();
    invalidateQueries();
    onClose();

    if (consultation.status !== "suggested") {
      toast(t("cancel_success"));
    }
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

  // Suggest new time functionality
  const onSuggestConsultationSuccess = () => {
    // After suggesting, cancel the original consultation
    cancelConsultationMutation.mutate({
      consultationId: consultation.consultationId,
      price,
      shouldRefund,
    });
    setIsBlockSlotSubmitting(false);
    setIsSelectConsultationOpen(false);
    window.dispatchEvent(new Event("new-notification"));
    setBlockSlotError(null);
    toast(t("suggest_success"));
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
      clientId: clientDetailId,
    });
  };

  const handleSuggestNewTime = () => {
    setIsSelectConsultationOpen(true);
  };

  const closeSelectConsultation = () => {
    setIsSelectConsultationOpen(false);
    setBlockSlotError(null);
  };
  console.log(consultation.status, "consultation status");
  return (
    <>
      <Backdrop
        classes="cancel-consultation"
        title="CancelConsultation"
        isOpen={isOpen}
        onClose={onClose}
        heading={
          price > 0
            ? t("paid_heading", { price })
            : consultation.status === "suggested"
            ? t("heading_suggested")
            : t("heading")
        }
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
        customButton={
          consultation.status !== "suggested" && (
            <Button
              size="lg"
              label={t("suggest_new_time")}
              onClick={handleSuggestNewTime}
              classes="cancel-consultation__suggest-btn"
            />
          )
        }
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
      <SelectConsultation
        isOpen={isSelectConsultationOpen}
        onClose={closeSelectConsultation}
        providerId={providerId}
        handleBlockSlot={handleBlockSlot}
        errorMessage={blockSlotError}
        isCtaDisabled={isBlockSlotSubmitting}
      />
    </>
  );
};
