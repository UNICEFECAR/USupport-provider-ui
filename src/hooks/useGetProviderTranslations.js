import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetProviderTranslations() {
  const fetchProviderTranslations = async () => {
    const response = await providerSvc.getMyProviderTranslations();
    return response.data || {};
  };

  return useQuery(["provider-translations"], fetchProviderTranslations, {
    staleTime: Infinity,
  });
}

export { useGetProviderTranslations };
