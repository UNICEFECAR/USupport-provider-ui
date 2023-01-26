import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export const useGetProviderActivities = () => {
  const getProviderActivities = async () => {
    const { data } = await providerSvc.getProviderActivities();

    return data.map((activity) => {
      const client = activity.clientData;
      return {
        displayName: client.name
          ? `${client.name} ${client.surname}`
          : client.email || client.nickname,
        couponId: activity.coupon_id,
        price: activity.price,
        status: activity.status,
        time: new Date(activity.time),
        type: activity.type,
      };
    });
  };
  return useQuery(["providerActivities"], getProviderActivities);
};
