import React, { useState } from "react";
import { Page, Dashboard as DashboardBlock } from "#blocks";
import { CancelConsultation, JoinConsultation } from "#backdrops";

import "./dashboard.scss";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Dashboard
 *
 * Provider dashboard page
 *
 * @returns {JSX.Element}
 */
export const Dashboard = () => {
  const queryClient = useQueryClient();
  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const openCancelConsultation = (consultation) => {
    setIsCancelConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setIsJoinConsultationOpen(true);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const [selectedConsultation, setSelectedConsultation] = useState();

  const handleCancellationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["calendar-data"] });
    queryClient.invalidateQueries({ queryKey: ["consultations-single-day"] });
  };

  return (
    <Page classes="page__dashboard" showGoBackArrow={false}>
      <DashboardBlock
        openJoinConsultation={openJoinConsultation}
        openCancelConsultation={openCancelConsultation}
      />

      {selectedConsultation && (
        <CancelConsultation
          isOpen={isCancelConsultationOpen}
          onClose={closeCancelConsultation}
          consultation={selectedConsultation}
          onSuccess={handleCancellationSuccess}
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
