import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { getDateView } from "@USupport-components-library/utils";

export function useGetCampaigns(enabled = true) {
  const getCampaigns = async () => {
    const { data } = await providerSvc.getCampaigns();

    const today = new Date().getTime();

    const allCampaigns = data.activeCampaigns.map((x) => {
      return {
        sponsorName: x.sponsor_name,
        sponsorId: x.sponsor_id,
        sponsorImage: x.sponsor_image,
        campaignId: x.campaign_id,
        campaignName: x.name,
        couponSinglePrice: x.price_per_coupon,
        couponCode: x.coupon_code,
        numberOfCoupons: x.number_of_coupons,
        startDate: getDateView(x.start_date),
        endDate: getDateView(x.end_date),
        termsAndConditions: x.terms_and_conditions,
        conductedConsultationsForCampaign: Number(x.conducted_consultations),
        isActive:
          // new Date(x.start_date).getTime() <= today &&
          new Date(x.end_date).getTime() >= today && x.active,
        isInPast: new Date(x.end_date).getTime() < today,
      };
    });

    const providerCampaigns = [];
    const providerPastCampaigns = [];
    const availableCampaigns = [];

    allCampaigns.forEach((campaign) => {
      if (data?.providerCampaignIds.includes(campaign.campaignId)) {
        if (campaign.isActive) {
          providerCampaigns.push(campaign);
        } else if (campaign.isInPast) {
          providerPastCampaigns.push(campaign);
        }
      } else {
        if (campaign.isActive) {
          availableCampaigns.push(campaign);
        }
      }
    });

    return {
      availableCampaigns,
      providerCampaigns,
      providerPastCampaigns,
    };
  };

  const getCampaignsQuery = useQuery(["campaigns"], getCampaigns, { enabled });

  return getCampaignsQuery;
}
