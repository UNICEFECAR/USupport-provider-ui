import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { DEFAULT_DURATION_MINUTES } from "@USupport-components-library/utils";

export const useGetConsultationsForSingleDay = (date, enabled = true) => {
  const getconsultationsForSingleDay = async () => {
    const { data } = await providerSvc.getConsultationsForSingleDay(date);
    const currentDate = new Date(date * 1000).toISOString();
    const dateWithoutTime = currentDate.split("T")[0];
    const currentDayDate = dateWithoutTime.split("-")[2];
    const currentDayMonth = dateWithoutTime.split("-")[1];
    const currentDayYear = dateWithoutTime.split("-")[0];

    const filtered = data.filter((consultation) => {
      const cDate = new Date(consultation.time);

      const isSameDay =
        cDate.getDate() === Number(currentDayDate) &&
        cDate.getMonth() === Number(currentDayMonth) - 1 &&
        cDate.getFullYear() === Number(currentDayYear);

      if (!isSameDay) {
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
      // Without this the card falls back to an hour, so a 30-minute
      // consultation renders an end time it does not have.
      durationMinutes:
        Number(consultation.duration_minutes) || DEFAULT_DURATION_MINUTES,
      status: consultation.status,
      price: consultation.price,
      campaignId: consultation.campaign_id,
      couponPrice: consultation.coupon_price,
      sponsorImage: consultation.sponsor_image,
      sponsorName: consultation.sponsor_name,
      organizationId: consultation.organization_id,
    }));
  };

  const query = useQuery(
    ["consultations-single-day", date],
    getconsultationsForSingleDay,
    { enabled }
  );

  return query;
};
