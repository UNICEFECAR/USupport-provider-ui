import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { providerSvc } from "@USupport-components-library/services";

/**
 * Reuseable hook to get and transform the provider data in a desired format
 */
export default function useGetProviderData(id = null, enabled = true) {
  const [providersData, setProvidersData] = useState();
  const abortController = new AbortController();
  const { signal } = abortController;

  const fetchProvidersData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!enabled || !token) {
      abortController.abort();
      return null;
    }
    let data;
    if (id) {
      const response = await providerSvc.getProviderById(id, signal);
      data = response.data;
    } else {
      const response = await providerSvc.getProviderData(signal);
      data = response.data;
    }

    const formattedData = {
      providerDetailId: data.provider_detail_id || "",
      name: data.name || "",
      patronym: data.patronym || "",
      surname: data.surname || "",
      nickname: data.nickname || "",
      email: data.email || "",
      phone: data.phone || "",
      image: data.image || "default",
      specializations: data.specializations || [],
      street: data.street || "",
      city: data.city || "",
      postcode: data.postcode || "",
      education: data.education || [],
      sex: data.sex || "",
      consultationPrice: data.consultation_price || 0,
      description: data.description || "",
      languages: data.languages || [],
      workWith: data.work_with || [],
      totalConsultations: data.total_consultations || 0,
      earliestAvailableSlot: data.earliest_available_slot || "",
      videoLink: data.video_link || "",
      status: data.status,
    };
    return formattedData;
  }, [enabled]);

  const providersDataQuery = useQuery(["provider-data"], fetchProvidersData, {
    onSuccess: (data) => {
      const dataCopy = JSON.parse(JSON.stringify(data));
      setProvidersData({ ...dataCopy });
    },
    notifyOnChangeProps: ["data"],
    enabled,
  });

  useEffect(() => {
    if (
      (providersDataQuery.isRefetching || providersDataQuery.isFetching) &&
      !enabled
    ) {
      abortController.abort();
    }
  }, [abortController, enabled, providersDataQuery.isFetching]);

  return [providersDataQuery, providersData, setProvidersData];
}

export { useGetProviderData };
