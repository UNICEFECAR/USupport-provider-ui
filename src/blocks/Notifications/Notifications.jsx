import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  Block,
  Button,
  Grid,
  GridItem,
  Icon,
  Loading,
  Notification,
} from "@USupport-components-library/src";
import {
  getDateView,
  getTimeAsString,
  ONE_HOUR,
} from "@USupport-components-library/utils";
import {
  notificationsSvc,
  clientSvc,
} from "@USupport-components-library/services";

import { useMarkNotificationsAsRead } from "#hooks";

import "./notifications.scss";

/**
 * Notifications
 *
 * Notifications block
 *
 * @return {jsx}
 */
export const Notifications = () => {
  const { t } = useTranslation("notifications");
  const navigate = useNavigate();

  const [isLoadingClients, setIsLoadingClients] = useState(true);

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
          time: content.time * 1000,
          clientDetailId: content.client_detail_id,
          consultationId: content.consultation_id,
          newConsultationTime: content.new_consultation_time * 1000,
        },
      };
    });
  };

  const [notificationClients, setNotificationClients] = useState({});
  const getClientNameForNotification = async (clientDetailId) => {
    // Check if we already have the client name in the cache
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
      // Make sure we don't fetch the same client twice
      if (alreadyFetchedClients.includes(notificationData.clientDetailId))
        continue;

      const response = await getClientNameForNotification(
        notificationData.clientDetailId
      );
      if (!response || !response.data) continue;

      // Construct the client name
      const clientData = response.data;
      const clientName = `${clientData.name} ${clientData.surname}`;

      alreadyFetchedClients.push(notificationData.clientDetailId);
      notificationClientsCopy[notificationData.clientDetailId] = clientName;
    }
    setNotificationClients(notificationClientsCopy);
    setIsLoadingClients(false);
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
          data.pages.flat().map((x) => {
            return {
              clientDetailId: x.content.clientDetailId,
              notificationId: x.notificationId,
            };
          })
        );
      },
    }
  );

  // Mark all notificartions as read logic
  // Because of the load on scroll we mark as read
  // only the currently shown/fetched notifications
  const onMarkAllAsReadError = (error) => toast(error, { type: "error" });
  const markAllAsReadMutation =
    useMarkNotificationsAsRead(onMarkAllAsReadError);
  const handleMarkAllAsRead = async () => {
    const unreadNotificationsIds = notificationsQuery.data?.pages
      .flat()
      ?.filter((x) => !x.isRead)
      .map((x) => x.notificationId);
    markAllAsReadMutation.mutate(unreadNotificationsIds);
  };

  const renderNotification = (notification) => {
    if (!notification.content) return null;
    let time, date, startHour, endHour;

    if (notification.content.time) {
      time = notification.content.time;
      date = getDateView(time);
      startHour = getTimeAsString(new Date(time));
      endHour = getTimeAsString(new Date(time + ONE_HOUR));
    }

    let newDate, newStartHour, newEndHour;
    if (notification.content.newConsultationTime) {
      const newTime = notification.content.newConsultationTime;
      newDate = getDateView(newTime);
      newStartHour = getTimeAsString(new Date(newTime));
      newEndHour = getTimeAsString(new Date(newTime + ONE_HOUR));
    }

    const handleNotificationClick = (
      notificationId,
      redirectTo = "/consultations"
    ) => {
      markAllAsReadMutation.mutate([notificationId]), navigate(redirectTo);
    };

    switch (notification.type) {
      case "consultation_booking":
        return (
          <Notification
            date={notification.createdAt}
            isRead={notification.isRead}
            title="USupportMe"
            text={t(notification.type, {
              clientName:
                notificationClients[notification.content.clientDetailId],
              date,
              startHour,
              endHour,
            })}
            icon="calendar"
          />
        );
      case "consultation_reschedule":
        return (
          <Notification
            date={notification.createdAt}
            isRead={notification.isRead}
            title="USupportMe"
            text={t(notification.type, {
              clientName:
                notificationClients[notification.content.clientDetailId],
              date,
              startHour,
              endHour,
              newDate,
              newStartHour,
              newEndHour,
            })}
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_cancellation":
        return (
          <Notification
            date={notification.createdAt}
            isRead={notification.isRead}
            title="USupportMe"
            text={t(notification.type, {
              clientName:
                notificationClients[notification.content.clientDetailId],
              date,
              startHour,
              endHour,
            })}
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_cancellation_provider":
        return (
          <Notification
            date={notification.createdAt}
            isRead={notification.isRead}
            title="USupportMe"
            text={t(notification.type, {
              clientName:
                notificationClients[notification.content.clientDetailId],
              date,
              startHour,
              endHour,
            })}
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_remind_start":
        return (
          <Notification
            date={notification.createdAt}
            isRead={notification.isRead}
            title="USupportMe"
            text={t(notification.type, {
              minutes: notification.content.minToConsultation,
            })}
            icon="calendar"
          >
            <Button
              classes="notifications__center-button"
              size="md"
              label={t("join")}
              color="purple"
            />
          </Notification>
        );
      case "consultation_suggestion":
        return (
          <Notification
            date={notification.createdAt}
            isRead={notification.isRead}
            title="USupportMe"
            text={t(notification.type, {
              clientName:
                notificationClients[notification.content.clientDetailId],
              date,
              startHour,
              endHour,
            })}
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_suggestion_booking":
        return (
          <Notification
            date={notification.createdAt}
            isRead={notification.isRead}
            title="USupportMe"
            text={t(notification.type, {
              clientName:
                notificationClients[notification.content.clientDetailId],
              date,
              startHour,
              endHour,
            })}
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_suggestion_cancellation":
        return (
          <Notification
            date={notification.createdAt}
            isRead={notification.isRead}
            title="USupportMe"
            text={t(notification.type, {
              clientName:
                notificationClients[notification.content.clientDetailId],
              date,
              startHour,
              endHour,
            })}
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );

      case "add_more_availability_slots":
        return (
          <Notification
            date={notification.createdAt}
            isRead={notification.isRead}
            title="USupportMe"
            icon="calendar"
            text={t(notification.type)}
            handleClick={() =>
              handleNotificationClick(notification.notificationId, "/scheduler")
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Block classes="notifications">
      <div className="notifications__heading-container">
        <Icon name="arrow-chevron-back" size="md" color="#20809E" />
        <h3 className="notifications__heading-container__heading">
          {t("heading")}
        </h3>
        <p
          className="paragraph notifications__heading-container__mark-read"
          onClick={handleMarkAllAsRead}
        >
          {t("mark_read")}
        </p>
      </div>
      <p className="text notifications__subheading">{t("subheading")}</p>
      {isLoadingClients ? (
        <Loading size="lg" />
      ) : (
        <InfiniteScroll
          dataLength={notificationsQuery.data?.pages.length || 0}
          hasMore={notificationsQuery.hasNextPage}
          loader={<Loading />}
          next={() => notificationsQuery.fetchNextPage()}
          initialScrollY={20}
          scrollThreshold={0}
        >
          <Grid classes="notifications__grid">
            {notificationsQuery.isLoading ? (
              <GridItem md={8} lg={12}>
                <Loading size="lg" />
              </GridItem>
            ) : null}

            {!notificationsQuery.isLoading &&
            notificationsQuery.data.pages.flat().length === 0 ? (
              <GridItem
                md={8}
                lg={12}
                classes="notifications__grid__no-notifications"
              >
                <h3>{t("no_notifications")}</h3>
              </GridItem>
            ) : null}

            {notificationsQuery.data?.pages.map((notifications, key) => {
              return (
                <React.Fragment key={key}>
                  {notifications?.map((notification) => {
                    const notificationToDisplay =
                      renderNotification(notification);
                    return notificationToDisplay ? (
                      <GridItem
                        key={notification.notificationId}
                        md={8}
                        lg={12}
                      >
                        {notificationToDisplay}
                      </GridItem>
                    ) : null;
                  })}
                </React.Fragment>
              );
            })}
          </Grid>
        </InfiniteScroll>
      )}
    </Block>
  );
};
