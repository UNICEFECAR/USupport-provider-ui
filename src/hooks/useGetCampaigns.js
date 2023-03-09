import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { getDateView } from "@USupport-components-library/utils";

export function useGetCampaigns(enabled = true) {
  const getCampaigns = async () => {
    const { data } = await providerSvc.getCampaigns();

    const allCampaigns = data.activeCampaigns.map((x) => ({
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
    }));

    const providerCampaigns = [];
    const availableCampaigns = [];

    allCampaigns.forEach((campaign) => {
      if (data?.providerCampaignIds.includes(campaign.campaignId)) {
        providerCampaigns.push(campaign);
      } else {
        availableCampaigns.push(campaign);
      }
    });

    return {
      availableCampaigns,
      providerCampaigns,
    };
  };

  const getCampaignsQuery = useQuery(["campaigns"], getCampaigns, { enabled });

  return getCampaignsQuery;
}
