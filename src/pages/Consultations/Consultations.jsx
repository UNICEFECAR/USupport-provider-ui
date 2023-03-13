import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
      handleGoBack={() => navigate(-1)}
    >
      <ConsultationsBlock
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
