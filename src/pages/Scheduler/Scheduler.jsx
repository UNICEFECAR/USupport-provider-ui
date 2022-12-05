import React, { useState } from "react";
import { Page, Scheduler as SchedulerBlock } from "#blocks";
import { JoinConsultation, CancelConsultation } from "#backdrops";

import "./scheduler.scss";

/**
 * Scheduler
 *
 * Scheduler page
 *
 * @returns {JSX.Element}
 */
export const Scheduler = () => {
  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState();

  const handleJoinConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setIsJoinConsultationOpen(true);
  };

  const handleOpenCancelConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setIsCancelConsultationOpen(true);
  };

  return (
    <Page showGoBackArrow={false} classes="page__scheduler">
      <SchedulerBlock
        openJoinConsultation={handleJoinConsultation}
        openCancelConsultation={handleOpenCancelConsultation}
      />
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={() => setIsJoinConsultationOpen(false)}
        consultation={selectedConsultation}
      />
      {selectedConsultation && (
        <CancelConsultation
          isOpen={isCancelConsultationOpen}
          onClose={() => setIsCancelConsultationOpen(false)}
          consultation={selectedConsultation}
        />
      )}
    </Page>
  );
};
