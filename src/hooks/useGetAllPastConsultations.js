import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetAllPastConsultations() {
  const fetchAllPastConsultations = async () => {
    const response = await providerSvc.getAllPastConsultations();

    const data = response.data;
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
      organizationName: consultation.organization_name,
      organizationId: consultation.organization_id,
    }));
  };

  const query = useQuery(["all-past-consultations"], fetchAllPastConsultations);

  return query;
}

export { useGetAllPastConsultations };
