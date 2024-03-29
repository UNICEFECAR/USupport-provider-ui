import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetAllClients() {
  const fetchAllClients = async () => {
    const { data } = await providerSvc.getAllClients();
    return data?.map((client) => ({
      clientDetailId: client.client_detail_id,
      chatId: client.chat_id,
      name: client.client_name,
      image: client.client_image,
      nextConsultation: new Date(client.next_consultation).getTime(),
      nextConsultationId: client.next_consultation_id,
      nextConsultationStatus: client.next_consultation_status,
      nextConsultationPrice: client.next_consultation_price,
      nextConsultationCouponPrice: client.next_consultation_coupon_price,
      nextConsultationCampaignId: client.next_consultation_campaign_id,
      nextConsultationSponsorName: client.next_consultation_sponsor_name,
      pastConsultations: client.past_consultations,
    }));
  };
  const query = useQuery(["all-clients"], fetchAllClients);

  return query;
}

export { useGetAllClients };
