import React from "react";
import { useTranslation, Trans } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomNavigate as useNavigate } from "#hooks";

import {
  Block,
  Button,
  Grid,
  GridItem,
  Loading,
  Notification,
} from "@USupport-components-library/src";

import {
  getDateView,
  getTimeAsString,
  ONE_HOUR,
  checkIsFiveMinutesBefore,
  getTimestampFromUTC,
} from "@USupport-components-library/utils";

import { useGetConsultationsForSingleDay } from "#hooks";

import "./notifications.scss";

/**
 * Notifications
 *
 * Notifications block
 *
 * @return {jsx}
 */
export const Notifications = ({
  openJoinConsultation,
  isLoadingClients,
  notificationsQuery,
  notificationClients,
  markNotificationAsReadByIdMutation,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "notifications" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const currentDate = getTimestampFromUTC(new Date());
  let consultationsData = queryClient.getQueryData([
    "consultations-single-day",
    currentDate,
  ]);

  let fetchConsultations = false;

  if (!consultationsData || consultationsData.length === 0) {
    fetchConsultations = true;
  }

  const consultationsDataQuery = useGetConsultationsForSingleDay(
    currentDate,
    !!fetchConsultations
  );

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
      markNotificationAsReadByIdMutation.mutate([notificationId]);
      navigate(redirectTo);
    };

    switch (notification.type) {
      case "consultation_booking":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans components={[<b></b>]}>
                {t(notification.type, {
                  clientName:
                    notificationClients[notification.content.clientDetailId],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_reschedule":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans components={[<b></b>]}>
                {t(notification.type, {
                  clientName:
                    notificationClients[notification.content.clientDetailId],
                  date,
                  startHour,
                  endHour,
                  newDate,
                  newStartHour,
                  newEndHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_cancellation":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans components={[<b></b>]}>
                {t(notification.type, {
                  clientName:
                    notificationClients[notification.content.clientDetailId],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_cancellation_provider":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans components={[<b></b>]}>
                {t(notification.type, {
                  clientName:
                    notificationClients[notification.content.clientDetailId],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_remind_start":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans components={[<b></b>]}>
                {t(notification.type, {
                  minutes: notification.content.minToConsultation,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          >
            {checkIsFiveMinutesBefore(notification.content.time) && (
              <Button
                classes="notifications__center-button"
                size="md"
                label={t("join")}
                color="purple"
                onClick={() => {
                  const data =
                    consultationsData?.length !== 0
                      ? consultationsData
                      : consultationsDataQuery?.data;
                  const consultationToJoin = data.find(
                    (x) =>
                      x.consultationId === notification.content.consultationId
                  );
                  openJoinConsultation(consultationToJoin);
                }}
              />
            )}
          </Notification>
        );
      case "consultation_suggestion":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans components={[<b></b>]}>
                {t(notification.type, {
                  clientName:
                    notificationClients[notification.content.clientDetailId],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_suggestion_booking":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans components={[<b></b>]}>
                {t(notification.type, {
                  clientName:
                    notificationClients[notification.content.clientDetailId],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );
      case "consultation_suggestion_cancellation":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans components={[<b></b>]}>
                {t(notification.type, {
                  clientName:
                    notificationClients[notification.content.clientDetailId],
                  date,
                  startHour,
                  endHour,
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          />
        );

      case "add_more_availability_slots":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            icon="calendar"
            text={t(notification.type)}
            handleClick={() =>
              handleNotificationClick(notification.notificationId, "/dashboard")
            }
          />
        );
      case "weekly_report":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            icon="activities"
            text={t(notification.type)}
            handleClick={() =>
              handleNotificationClick(notification.notificationId, "/reports")
            }
          />
        );
      case "consultation_started":
        return (
          <Notification
            t={t}
            date={notification.createdAt}
            isRead={notification.isRead}
            title="uSupport"
            text={
              <Trans components={[<b></b>]}>
                {t(notification.type, {
                  clientName:
                    notificationClients[notification.content.clientDetailId],
                })}
              </Trans>
            }
            icon="calendar"
            handleClick={() =>
              handleNotificationClick(notification.notificationId)
            }
          >
            {checkIsFiveMinutesBefore(notification.content.time) && (
              <Button
                classes="notifications__center-button"
                size="md"
                label={t("join")}
                color="purple"
                onClick={() => {
                  const data =
                    consultationsData?.length !== 0
                      ? consultationsData
                      : consultationsDataQuery?.data;
                  const consultationToJoin = data.find(
                    (x) =>
                      x.consultationId === notification.content.consultationId
                  );
                  openJoinConsultation(consultationToJoin);
                }}
              />
            )}
          </Notification>
        );
      default:
        return null;
    }
  };

  return (
    <Block classes="notifications">
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
