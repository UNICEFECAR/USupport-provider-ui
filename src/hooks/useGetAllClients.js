import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetAllClients() {
  const fetchAllClients = async () => {
    const { data } = await providerSvc.getAllClients();
    return data?.map((client) => ({
      clientDetailId: client.client_detail_id,
      name: client.client_name,
      image: client.client_image,
      nextConsultation: new Date(client.next_consultation).getTime(),
      nextConsultationId: client.next_consultation_id,
      pastConsultations: client.past_consultations,
    }));
  };
  const query = useQuery(["all-clients"], fetchAllClients);

  return query;
}

export { useGetAllClients };
