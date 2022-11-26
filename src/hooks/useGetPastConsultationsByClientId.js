import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetPastConsultationsByClientId(clientId) {
  const fetchAllConsultations = async () => {
    const { data } = await providerSvc.getAllConsultationsByClientId(clientId);
    return data?.map((consultation) => ({
      consultationId: consultation.consultation_id,
      clientDetailId: consultation.client_detail_id,
      clientName: consultation.client_name,
      image: consultation.client_image,
      timestamp: consultation.time,
      status: consultation.status,
    }));
  };
  const query = useQuery(
    ["all-consultations", clientId],
    fetchAllConsultations
  );

  return query;
}

export { useGetPastConsultationsByClientId };
