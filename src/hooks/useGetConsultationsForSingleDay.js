import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export const useGetConsultationsForSingleDay = (date, enabled = true) => {
  const getconsultationsForSingleDay = async () => {
    const { data } = await providerSvc.getConsultationsForSingleDay(date);
    const filtered = data.filter((consultation) => {
      if (
        new Date(consultation.time).toLocaleDateString() !==
        new Date(date * 1000).toLocaleDateString()
      ) {
        return false;
      }
      return true;
    });
    return filtered?.map((consultation) => ({
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
      sponsorName: consultation.sponsor_name,
    }));
  };

  const query = useQuery(
    ["consultations-single-day", date],
    getconsultationsForSingleDay,
    { enabled }
  );

  return query;
};
