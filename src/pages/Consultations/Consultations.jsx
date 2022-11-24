import React, { useState } from "react";
import { Page, Consultations as ConsultationsBlock } from "#blocks";
import { CancelConsultation, JoinConsultation } from "#backdrops";
import "./consultations.scss";

/**
 * Consultations
 *
 * consultations
 *
 * @returns {JSX.Element}
 */
export const Consultations = () => {
  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const openCancelConsultation = () => setIsCancelConsultationOpen(true);
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = () => setIsJoinConsultationOpen(true);
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  return (
    <Page classes="page__consultations" showNavbar={true} showFooter={true}>
      <ConsultationsBlock
        openJoinConsultation={openJoinConsultation}
        openCancelConsultation={openCancelConsultation}
      />
      <CancelConsultation
        isOpen={isCancelConsultationOpen}
        onClose={closeCancelConsultation}
      />
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
      />
    </Page>
  );
};
