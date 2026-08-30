import React, { useState } from "react";
import { Page, ScheduleDashboard as ScheduleDashboardBlock } from "#blocks";
import { CancelConsultation, JoinConsultation } from "#backdrops";
import { useQueryClient } from "@tanstack/react-query";

import "./schedule-dashboard.scss";

/**
 * ScheduleDashboard
 *
 * Combined provider schedule page (stats + calendar + upcoming consultations).
 *
 * @returns {JSX.Element}
 */
export const ScheduleDashboard = () => {
  const queryClient = useQueryClient();
  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState();

  const openCancelConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setIsCancelConsultationOpen(true);
  };
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  const openJoinConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setIsJoinConsultationOpen(true);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const handleCancellationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["calendar-data"] });
    queryClient.invalidateQueries({ queryKey: ["consultations-single-day"] });
    queryClient.invalidateQueries({ queryKey: ["upcoming-consultations"] });
    queryClient.invalidateQueries({ queryKey: ["consultations"] });
    queryClient.invalidateQueries({ queryKey: ["consultations-month"] });
    queryClient.invalidateQueries({ queryKey: ["available-slots"] });
  };

  return (
    <Page classes="page__schedule-dashboard" showGoBackArrow={false}>
      <ScheduleDashboardBlock
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
