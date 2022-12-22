import { useQuery } from "@tanstack/react-query";
import { notificationsSvc } from "@USupport-components-library/services";

export const useCheckHasUnreadNotifications = () => {
  const checkHasUnreadNotifications = async () => {
    const { data } = await notificationsSvc.checkHasUnreadNotifications();
    return data;
  };

  const checkHasUnreadNotificationsQuery = useQuery(
    ["has-unread-notifications"],
    checkHasUnreadNotifications
  );

  return checkHasUnreadNotificationsQuery;
};
