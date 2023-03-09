import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetPastConsultationsByClientId(clientId) {
  const fetchAllConsultations = async () => {
    const { data } = await providerSvc.getAllConsultationsByClientId(clientId);
    return data?.map((consultation) => ({
      consultationId: consultation.consultation_id,
      chatId: consultation.chat_id,
      clientDetailId: consultation.client_detail_id,
      clientName: consultation.client_name,
      image: consultation.client_image,
      timestamp: new Date(consultation.time).getTime(),
      status: consultation.status,
      price: consultation.price,
      campaignId: consultation.campaign_id,
      couponPrice: consultation.coupon_price,
      sponsorImage: consultation.sponsor_image,
    }));
  };
  const query = useQuery(
    ["all-consultations", clientId],
    fetchAllConsultations
  );

  return query;
}

export { useGetPastConsultationsByClientId };
