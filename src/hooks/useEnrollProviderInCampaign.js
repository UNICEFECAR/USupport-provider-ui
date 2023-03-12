import { useMutation } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { useError } from "#hooks";

export function useEnrollProviderInCampaign(onSuccess, onError) {
  const enrollProviderInCampaign = async (campaignId) => {
    const { data } = await providerSvc.enrollProviderInCampaign(campaignId);

    return data;
  };

  const enrollProviderInCampaignMutation = useMutation(
    ["enrollProviderInCampaign"],
    enrollProviderInCampaign,
    {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        const { message: errorMessage } = useError(error);
        onError(errorMessage);
      },
    }
  );

  return enrollProviderInCampaignMutation;
}
