import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetAllClients() {
  const fetchAllClients = async () => {
    const { data } = await providerSvc.getAllClients();
    return data?.map((client) => ({
      clientDetailId: client.client_detail_id,
      name: client.client_name,
      image: client.client_image,
      nextConsultation: client.next_consultation,
      pastConsultations: client.past_consultations,
    }));
  };
  const query = useQuery(["all-clients"], fetchAllClients);

  return query;
}

export { useGetAllClients };