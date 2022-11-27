import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetAllConsultationsByFilter(filter) {
  const fetchAllConsultations = async () => {
    let response;
    if (filter === "upcoming") {
      response = await providerSvc.getAllUpcomingConsultations();
    } else {
      response = await providerSvc.getAllPastConsultations();
    }
    const data = response.data;
    return data?.map((consultation) => ({
      consultationId: consultation.consultation_id,
      clientDetailId: consultation.client_detail_id,
      clientName: consultation.client_name,
      image: consultation.client_image,
      timestamp: new Date(consultation.time).getTime(),
      status: consultation.status,
    }));
  };
  const query = useQuery(["all-consultations", filter], fetchAllConsultations);

  return query;
}

export { useGetAllConsultationsByFilter };
