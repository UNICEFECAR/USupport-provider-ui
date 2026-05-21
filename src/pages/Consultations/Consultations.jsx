import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Page, Consultations as ConsultationsBlock } from "#blocks";
import { CancelConsultation, JoinConsultation } from "#backdrops";

import "./consultations.scss";

/**
 * Consultations
 *
 * Consultations page
 *
 * @returns {JSX.Element}
 */
export const Consultations = () => {
  const { t } = useTranslation("pages", { keyPrefix: "consultations-page" });

  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const openCancelConsultation = (consultation) => {
    setIsCancelConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = (consultation) => {
    setIsJoinConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const [selectedConsultation, setSelectedConsultation] = useState();

  return (
    <Page
      classes="page__consultations"
      showNavbar={true}
      showFooter={true}
      showGoBackArrow={false}
    >
      <ConsultationsBlock
        subheading={t("subheading")}
        openJoinConsultation={openJoinConsultation}
        openCancelConsultation={openCancelConsultation}
      />
      {selectedConsultation && (
        <CancelConsultation
          isOpen={isCancelConsultationOpen}
          onClose={closeCancelConsultation}
          consultation={selectedConsultation}
        />
      )}
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
        consultation={selectedConsultation}
      />
    </Page>
  );
};
