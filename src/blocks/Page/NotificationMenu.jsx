import React, { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "react-toastify";

import {
  Notification,
  Loading,
  NewButton,
  Tabs,
} from "@USupport-components-library/src";
import {
  notificationsSvc,
  clientSvc,
} from "@USupport-components-library/services";
import {
  getDateView,
  getTimeAsString,
  ONE_HOUR,
} from "@USupport-components-library/utils";
import {
  useCustomNavigate as useNavigate,
  useIsLoggedIn,
  useMarkNotificationsAsRead,
  useMarkAllNotificationsAsRead,
} from "#hooks";

const getRedirectForType = (type) => {
  if (type === "add_more_availability_slots") return "/calendar";
  if (type === "weekly_report") return "/reports";
  return "/consultations";
};

export const NotificationMenu = ({ closePanel }) => {
  const [tabs] = useState(["all", "new", "read"]);
  const [selectedTab, setSelectedTab] = useState("all");
  const loadMoreRef = useRef(null);

  const navigateTo = useNavigate();
  const { t } = useTranslation("blocks", { keyPrefix: "page" });
  const { t: tNotification } = useTranslation("blocks", {
    keyPrefix: "notifications",
  });
  const isLoggedIn = useIsLoggedIn();

  const [notificationClients, setNotificationClients] = useState({});
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const getClientNameForNotification = async (clientDetailId) => {
    if (Object.keys(notificationClients).includes(clientDetailId)) {
      return notificationClients[clientDetailId];
    }
    if (!clientDetailId) return null;
    return clientSvc.getClientDataById(clientDetailId);
  };

  const fetchClientsData = async (data) => {
    const copy = { ...notificationClients };
    const fetched = [];
    for (let i = 0; i < data.length; i++) {
      const nd = data[i];
      if (fetched.includes(nd.clientDetailId)) continue;
      const response = await getClientNameForNotification(nd.clientDetailId);
      if (!response || !response.data) continue;
      const clientData = response.data;
      const clientName =
        clientData.name && clientData.surname
          ? `${clientData.name} ${clientData.surname}`
          : clientData.nickname;
      copy[nd.clientDetailId] = clientName;
      fetched.push(nd.clientDetailId);
    }
    setNotificationClients(copy);
    setIsLoadingClients(false);
  };

  const getNotifications = async ({ pageParam }) => {
    const { data } = await notificationsSvc.getNotifications(
      pageParam,
      selectedTab,
    );
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
    ["notifications", selectedTab],
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
      enabled: isLoggedIn === true,
    },
  );

  const onMarkAllAsReadSuccess = () => {
    window.dispatchEvent(new Event("all-notifications-read"));
  };
  const onMarkAllAsReadError = (error) => toast(error, { type: "error" });
  const markNotificationAsReadByIdMutation =
    useMarkNotificationsAsRead(onMarkAllAsReadError);
  const markAllAsReadMutation = useMarkAllNotificationsAsRead(
    onMarkAllAsReadSuccess,
    onMarkAllAsReadError,
  );

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (!sentinel) return;
    if (!notificationsQuery.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          notificationsQuery.hasNextPage &&
          !notificationsQuery.isFetchingNextPage
        ) {
          notificationsQuery.fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 200px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [
    notificationsQuery.hasNextPage,
    notificationsQuery.isFetchingNextPage,
    selectedTab,
  ]);

  const renderNotificationItem = (notification) => {
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
    const redirectTo = getRedirectForType(notification.type);
    const handleClick = (notificationId) => {
      markNotificationAsReadByIdMutation.mutate([notificationId]);
      navigateTo(redirectTo);
    };
    const clientName =
      notificationClients[notification.content.clientDetailId];
    const typeData = {
      date,
      startHour,
      endHour,
      clientName,
      newDate,
      newStartHour,
      newEndHour,
      minutes: notification.content?.minToConsultation,
    };

    const typesWithoutClient = [
      "add_more_availability_slots",
      "weekly_report",
    ];
    const text = typesWithoutClient.includes(notification.type) ? (
      tNotification(notification.type)
    ) : (
      <Trans components={[<b></b>]}>
        {tNotification(notification.type, typeData)}
      </Trans>
    );

    return (
      <Notification
        t={tNotification}
        date={notification.createdAt}
        isRead={notification.isRead}
        title="uSupport"
        text={text}
        handleClick={() => handleClick(notification.notificationId)}
      />
    );
  };

  return (
    <div className="nav__notifications-dropdown__inner">
      <div className="nav__notifications-dropdown__header">
        <h4>{t("notifications_heading")}</h4>
        <div className="nav__notifications-dropdown__header__subheading-container">
          <Tabs
            options={tabs.map((tab) => ({
              label: t(tab),
              value: tab,
              isSelected: selectedTab === tab,
            }))}
            handleSelect={(index) => setSelectedTab(tabs[index])}
            classes="nav__notifications-dropdown__header__subheading-container__tabs"
          />
          <NewButton
            onClick={() => markAllAsReadMutation.mutate()}
            classes="nav__notifications-dropdown__header__subheading-container__mark-read"
            size="sm"
            type="text"
          >
            {t("notifications_mark_read")}
          </NewButton>
        </div>
      </div>
      <div className="nav__notifications-dropdown__list">
        {isLoadingClients ? (
          <Loading size="lg" />
        ) : notificationsQuery.isLoading ? (
          <Loading size="lg" />
        ) : notificationsQuery.data?.pages.flat().length === 0 ? (
          <p className="nav__notifications-dropdown__empty">
            {t("notifications_empty")}
          </p>
        ) : (
          notificationsQuery.data?.pages.map((notifications, key) => (
            <React.Fragment key={key}>
              {notifications?.map((notification) => {
                const item = renderNotificationItem(notification);
                return item ? (
                  <div
                    key={notification.notificationId}
                    onClick={() => closePanel && closePanel()}
                  >
                    {item}
                  </div>
                ) : null;
              })}
            </React.Fragment>
          ))
        )}
        {notificationsQuery.hasNextPage && (
          <div ref={loadMoreRef} style={{ height: "1px", width: "100%" }} />
        )}
        {notificationsQuery.isFetchingNextPage && <Loading size="md" />}
      </div>
    </div>
  );
};
