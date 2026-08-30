import React from "react";

export const ScheduleDaySlotPicker = ({
  className = "schedule-day-slots__picker",
  style,
  hour,
  enrollment,
  orgList,
  campaignList,
  countryHasNormalSlots,
  onSelectOrganization,
  onSelectCampaign,
  onSelectNormal,
  t,
}) => (
  <div className={className} style={style}>
    {orgList.length > 0 && (
      <>
        <p className="schedule-day-slots__picker-title">
          {t("available_organizations")}
        </p>
        <ul className="schedule-day-slots__picker-list">
          {orgList.map((org) => {
            const selected = enrollment?.organizationIds.has(
              org.organizationId,
            );
            return (
              <li key={org.organizationId}>
                <button
                  type="button"
                  className={[
                    "schedule-day-slots__picker-item",
                    selected ? "schedule-day-slots__picker-item--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectOrganization(hour, org.organizationId)}
                >
                  <span>{org.name}</span>
                  {selected && (
                    <span
                      className="schedule-day-slots__picker-check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </>
    )}

    {campaignList.length > 0 && (
      <>
        <p className="schedule-day-slots__picker-title">
          {t("available_campaigns")}
        </p>
        <ul className="schedule-day-slots__picker-list">
          {campaignList.map((campaign) => {
            const selected = enrollment?.campaignIds.has(campaign.campaignId);
            return (
              <li key={campaign.campaignId}>
                <button
                  type="button"
                  className={[
                    "schedule-day-slots__picker-item",
                    selected ? "schedule-day-slots__picker-item--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectCampaign(hour, campaign.campaignId)}
                >
                  <span>{campaign.campaignName}</span>
                  {selected && (
                    <span
                      className="schedule-day-slots__picker-check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </>
    )}

    {countryHasNormalSlots && (
      <button
        type="button"
        className={[
          "schedule-day-slots__picker-item",
          enrollment?.hasNormalSlot
            ? "schedule-day-slots__picker-item--selected"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onSelectNormal(hour)}
      >
        <span>{t("slot_available")}</span>
        {enrollment?.hasNormalSlot && (
          <span className="schedule-day-slots__picker-check" aria-hidden="true">
            ✓
          </span>
        )}
      </button>
    )}
  </div>
);
