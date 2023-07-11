import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { ONE_HOUR } from "../../USupport-components-library/src/utils";

export default function useGetConsultationsForCampaign(campaignId) {
  const getConsultationsForCampaign = async () => {
    const response = await providerSvc.getConsultationsForCampaign(campaignId);

    let data = response.data;

    const upcomingConsultations = [];
    const pastConsultations = [];
    const currentDateTs = new Date().getTime();

    data = data.map((consultation) => ({
      consultationId: consultation.consultation_id,
      chatId: consultation.chat_id,
      clientDetailId: consultation.client_detail_id,
      clientName: consultation.client_name,
      image: consultation.client_image,
      timestamp: new Date(consultation.time).getTime(),
      status: consultation.status,
      price: consultation.price,
    }));

    data.forEach((consultation) => {
      const endTime = consultation.timestamp + ONE_HOUR;
      if (
        consultation.timestamp >= currentDateTs ||
        (currentDateTs >= consultation.timestamp && currentDateTs <= endTime)
      ) {
        upcomingConsultations.push(consultation);
      } else if (
        endTime < currentDateTs &&
        (consultation.status === "finished" ||
          consultation.status === "scheduled")
      ) {
        pastConsultations.push(consultation);
      }
    });

    return { upcomingConsultations, pastConsultations };
  };

  const getConsultationsForCampaignQuery = useQuery(
    ["campaign-consultations", campaignId],
    getConsultationsForCampaign
  );

  return getConsultationsForCampaignQuery;
}

export { useGetConsultationsForCampaign };
