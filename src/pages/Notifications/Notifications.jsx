import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Page, Notifications as NotificationsBlock } from "#blocks";
import { JoinConsultation } from "#backdrops";

import { useMarkAllNotificationsAsRead } from "#hooks";

import "./notifications.scss";

/**
 * Notifications
 *
 * Notifiations page
 *
 * @returns {JSX.Element}
 */
export const Notifications = () => {
  const { t } = useTranslation("notifications-page");
  const navigate = useNavigate();

  const [selectedConsultation, setSelectedConsultation] = useState();

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setIsJoinConsultationOpen(true);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const onMarkAllAsReadError = (error) => toast(error, { type: "error" });

  const onMarkAllAsReadSuccess = () => {
    window.dispatchEvent(new Event("all-notifications-read"));
  };

  const markAllAsReadMutation = useMarkAllNotificationsAsRead(
    onMarkAllAsReadSuccess,
    onMarkAllAsReadError
  );

  const handleMarkAllAsRead = async () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <Page
      classes="page__notifications"
      heading={t("heading")}
      subheading={t("subheading")}
      showGoBackArrow={true}
      handleGoBack={() => navigate(-1)}
      headingButton={
        <p
          className="paragraph page__notifications__mark-read"
          onClick={handleMarkAllAsRead}
        >
          {t("mark_read")}
        </p>
      }
    >
      <NotificationsBlock openJoinConsultation={openJoinConsultation} />
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
        consultation={selectedConsultation}
      />
    </Page>
  );
};
