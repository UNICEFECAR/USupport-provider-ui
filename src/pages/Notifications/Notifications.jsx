import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { Page, Notifications as NotificationsBlock } from "#blocks";
import { JoinConsultation } from "#backdrops";
import {
  useMarkNotificationsAsRead,
  useMarkAllNotificationsAsRead,
} from "#hooks";
import {
  notificationsSvc,
  clientSvc,
} from "@USupport-components-library/services";

import "./notifications.scss";

/**
 * Notifications
 *
 * Notifiations page
 *
 * @returns {JSX.Element}
 */
export const Notifications = () => {
  const { t } = useTranslation("pages", { keyPrefix: "notifications-page" });

  const [notificationClients, setNotificationClients] = useState({});
  const [selectedConsultation, setSelectedConsultation] = useState();
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setIsJoinConsultationOpen(true);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const getClientNameForNotification = async (clientDetailId) => {
    if (Object.keys(notificationClients).includes(clientDetailId)) {
      return notificationClients[clientDetailId];
    }
    if (!clientDetailId) return null;
    return clientSvc.getClientDataById(clientDetailId);
  };

  const fetchClientsData = async (data) => {
    const notificationClientsCopy = { ...notificationClients };
    const alreadyFetchedClients = [];

    for (let i = 0; i < data.length; i++) {
      const notificationData = data[i];
      if (alreadyFetchedClients.includes(notificationData.clientDetailId))
        continue;

      const response = await getClientNameForNotification(
        notificationData.clientDetailId,
      );
      if (!response || !response.data) continue;

      const clientData = response.data;
      const clientName =
        clientData.name && clientData.surname
          ? `${clientData.name} ${clientData.surname}`
          : clientData.nickname;

      alreadyFetchedClients.push(notificationData.clientDetailId);
      notificationClientsCopy[notificationData.clientDetailId] = clientName;
    }
    setNotificationClients(notificationClientsCopy);
    setIsLoadingClients(false);
  };

  const getNotifications = async ({ pageParam }) => {
    const { data } = await notificationsSvc.getNotifications(pageParam);
    return data.map((notification) => {
      const content = notification.content || {};
      return {
        notificationId: notification.notification_id,
        userId: notification.user_id,
        type: notification.type,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
        content: {
          ...content,
          time:
            typeof content.time === "string"
              ? new Date(content.time).getTime()
              : content.time * 1000,
          clientDetailId: content.client_detail_id,
          consultationId: content.consultation_id,
          newConsultationTime: content.new_consultation_time * 1000,
        },
      };
    });
  };

  const notificationsQuery = useInfiniteQuery(
    ["notifications"],
    getNotifications,
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return undefined;
        return pages.length + 1;
      },
      onSuccess: (data) => {
        fetchClientsData(
          data.pages.flat().map((x) => ({
            clientDetailId: x.content.clientDetailId,
            notificationId: x.notificationId,
          })),
        );
      },
    },
  );

  const onMarkAllAsReadSuccess = () => {
    window.dispatchEvent(new Event("all-notifications-read"));
  };

  const onMarkAllAsReadError = (error) => toast(error, { type: "error" });
  const markNotificationAsReadByIdMutation =
    useMarkNotificationsAsRead(onMarkAllAsReadError);

  const handleMarkAllAsRead = async () => {
    markAllAsReadMutation.mutate();
  };

  const markAllAsReadMutation = useMarkAllNotificationsAsRead(
    onMarkAllAsReadSuccess,
    onMarkAllAsReadError,
  );

  const headingButton = (
    <p className="page__notifications__mark-read" onClick={handleMarkAllAsRead}>
      {t("mark_read")}
    </p>
  );

  return (
    <Page
      classes="page__notifications"
      showGoBackArrow={false}
      heading={t("heading")}
      headingButton={headingButton}
      subheading={t("subheading")}
    >
      <NotificationsBlock
        openJoinConsultation={openJoinConsultation}
        isLoadingClients={isLoadingClients}
        notificationsQuery={notificationsQuery}
        notificationClients={notificationClients}
        markNotificationAsReadByIdMutation={markNotificationAsReadByIdMutation}
        markAllAsReadMutation={markAllAsReadMutation}
      />
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
        consultation={selectedConsultation}
      />
    </Page>
  );
};
