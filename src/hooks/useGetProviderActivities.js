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
        campaignName: activity.campaign_name,
        price: activity.price,
        status: activity.status,
        time: new Date(activity.time),
        type: activity.type,
        createdAt: new Date(activity.created_at),
      };
    });
  };
  return useQuery(["providerActivities"], getProviderActivities);
};
