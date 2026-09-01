import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Consultation,
  DailyAvailabilitySlot,
} from "@USupport-components-library/src";
import { isDateToday } from "@USupport-components-library/src/utils/date";

import { mapSlotDataForDailyComponent } from "./schedulerUtils.js";

function rawConsultationToCard(c) {
  return {
    consultationId: c.consultation_id,
    clientDetailId: c.client_detail_id,
    chatId: c.chat_id,
    image: c.client_image,
    clientName: c.client_name,
    status: c.status,
    timestamp: new Date(c.time).getTime(),
    price: c.price,
    couponPrice: c.coupon_price,
    sponsorImage: c.sponsor_image,
    sponsorName: c.sponsor_name,
    campaignId: c.campaign_id,
    organizationId: c.organization_id,
  };
}

function isHourVisibleInDayPanel(slotRows) {
  if (!slotRows?.length) return false;

  const primary = slotRows[0];
  if (primary.consultation) return true;
  if (primary.availabilityStatus !== "unavailable") return true;
  return !primary.isPastDay;
}

function useDayPanelData({
  selectedDay,
  consultationsRaw,
  hours,
  getSlotDataForHour,
}) {
  const dayConsultations = useMemo(
    () =>
      consultationsRaw
        .filter((c) => {
          const d = new Date(c.time);
          return (
            d.getFullYear() === selectedDay.getFullYear() &&
            d.getMonth() === selectedDay.getMonth() &&
            d.getDate() === selectedDay.getDate()
          );
        })
        .sort((a, b) => new Date(a.time) - new Date(b.time)),
    [consultationsRaw, selectedDay]
  );

  const visibleHours = useMemo(
    () =>
      hours.filter((hour) =>
        isHourVisibleInDayPanel(getSlotDataForHour(hour, selectedDay))
      ),
    [hours, getSlotDataForHour, selectedDay]
  );

  const openSlotsCount = useMemo(() => {
    let count = 0;
    for (const hour of hours) {
      const rows = getSlotDataForHour(hour, selectedDay);
      for (const row of rows) {
        if (
          !row.consultation &&
          (row.availabilityStatus === "available" ||
            row.availabilityStatus === "campaign" ||
            row.availabilityStatus === "organization")
        ) {
          count += 1;
        }
      }
    }
    return count;
  }, [hours, getSlotDataForHour, selectedDay]);

  const { availableSlotsCount, unavailableSlotsCount } = useMemo(() => {
    let available = 0;
    let unavailable = 0;

    for (const hour of visibleHours) {
      const rows = getSlotDataForHour(hour, selectedDay);
      for (const row of rows) {
        if (
          row.availabilityStatus === "available" ||
          row.availabilityStatus === "campaign" ||
          row.availabilityStatus === "organization"
        ) {
          available += 1;
        } else if (row.availabilityStatus === "unavailable") {
          unavailable += 1;
        }
      }
    }

    return { availableSlotsCount: available, unavailableSlotsCount: unavailable };
  }, [visibleHours, getSlotDataForHour, selectedDay]);

  return {
    dayConsultations,
    visibleHours,
    openSlotsCount,
    availableSlotsCount,
    unavailableSlotsCount,
  };
}

export const SchedulerMonthAppointmentsBox = ({
  selectedDay,
  listTitle,
  consultationsRaw,
  hours,
  getSlotDataForHour,
  handleCancelConsultation,
  handleViewProfile,
  handleJoinConsultation,
  language,
  t,
}) => {
  const { t: tConsultation } = useTranslation("blocks", {
    keyPrefix: "consultations",
  });

  const { dayConsultations, openSlotsCount } = useDayPanelData({
    selectedDay,
    consultationsRaw,
    hours,
    getSlotDataForHour,
  });

  const dateSubtitle = selectedDay.toLocaleDateString(language, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const isToday = isDateToday(selectedDay);

  return (
    <section className="scheduler-month__section-box scheduler-month__section-box--appointments">
      <div className="scheduler-month__day-panel-header">
        <div className="scheduler-month__day-panel-heading">
          <h3 className="scheduler-month__day-panel-title">{listTitle}</h3>
          {isToday && (
            <p className="scheduler-month__day-panel-subtitle">{dateSubtitle}</p>
          )}
        </div>
        <div className="scheduler-month__day-panel-stats">
          {isToday && (
            <span className="scheduler-month__stat scheduler-month__stat--today">
              {t("today")}
            </span>
          )}
          <span className="scheduler-month__stat">
            {t("month_appointments_count", {
              count: dayConsultations.length,
            })}
          </span>
          <span className="scheduler-month__stat scheduler-month__stat--slots">
            {t("month_open_slots_count", { count: openSlotsCount })}
          </span>
        </div>
      </div>

      {dayConsultations.length === 0 ? (
        <p className="scheduler-month__section-empty">
          {t("no_appointments_day")}
        </p>
      ) : (
        <ul className="scheduler-month__list">
          {dayConsultations.map((c) => {
            const consultation = rawConsultationToCard(c);

            return (
              <li key={c.consultation_id} className="scheduler-month__list-item">
                <Consultation
                  consultation={consultation}
                  renderIn="provider"
                  suggested={consultation.status === "suggested"}
                  overview={false}
                  hasMenu
                  handleJoinClick={handleJoinConsultation}
                  handleCancelConsultation={handleCancelConsultation}
                  handleViewProfile={handleViewProfile}
                  couponPrice={consultation.couponPrice}
                  sponsorImage={consultation.sponsorImage}
                  withOrganization={!!consultation.organizationId}
                  buttonSize="sm"
                  t={tConsultation}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export const SchedulerMonthAvailabilityBox = ({
  selectedDay,
  consultationsRaw,
  hours,
  getSlotDataForHour,
  handleSetAvailable,
  handleSetUnavailable,
  handleCancelConsultation,
  handleViewProfile,
  handleJoinConsultation,
  validCampaigns,
  organizations,
  countryHasNormalSlots,
  t,
}) => {
  const { visibleHours, availableSlotsCount, unavailableSlotsCount } =
    useDayPanelData({
      selectedDay,
      consultationsRaw,
      hours,
      getSlotDataForHour,
    });

  const isToday = isDateToday(selectedDay);

  return (
    <section className="scheduler-month__section-box scheduler-month__section-box--availability">
      <div className="scheduler-month__section-header">
        <h4 className="scheduler-month__section-title">
          {t("month_section_availability")}
        </h4>
        <div className="scheduler-month__availability-stats">
          <span
            className="scheduler-month__availability-stat scheduler-month__availability-stat--unavailable"
            title={t("month_unavailable_slots_count", {
              count: unavailableSlotsCount,
            })}
          >
            {unavailableSlotsCount}
          </span>
          <span
            className="scheduler-month__availability-stat scheduler-month__availability-stat--available"
            title={t("month_available_slots_count", {
              count: availableSlotsCount,
            })}
          >
            {availableSlotsCount}
          </span>
        </div>
      </div>

      {visibleHours.length === 0 ? (
        <p className="scheduler-month__section-empty">
          {t("month_no_upcoming_slots")}
        </p>
      ) : (
        <div className="scheduler-month__timeline">
          {visibleHours.map((hour) => {
            const slots = getSlotDataForHour(hour, selectedDay);
            const now = new Date();
            const isCurrentHour =
              isToday &&
              hour === `${String(now.getHours()).padStart(2, "0")}:00`;

            const wrappedHandleSetAvailable = ({
              campaignId,
              organizationId,
            }) => {
              handleSetAvailable(
                selectedDay,
                hour,
                campaignId,
                organizationId
              );
            };

            const wrappedHandleSetUnavailable = ({
              campaignId,
              organizationId,
            }) => {
              handleSetUnavailable(
                selectedDay,
                hour,
                campaignId,
                organizationId
              );
            };

            return (
              <div
                key={`month-slot-${hour}`}
                className="scheduler-month__timeline-row"
              >
                <div className="scheduler-month__timeline-hour">
                  <span
                    className={[
                      "scheduler-month__timeline-hour-text",
                      isCurrentHour
                        ? "scheduler-month__timeline-hour-text--current"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {hour}
                  </span>
                </div>
                <div className="scheduler-month__timeline-slots">
                  {slots.map((slotData, slotIndex) => {
                    const {
                      isAvailable,
                      campaignData,
                      enrolledCampaignsForSlot,
                    } = mapSlotDataForDailyComponent(slotData, validCampaigns);

                    return (
                      <DailyAvailabilitySlot
                        key={`month-slot-${hour}-${slotIndex}`}
                        isAvailable={isAvailable}
                        hasNormalSlot={slotData.hasNormalSlot}
                        consultation={slotData.consultation}
                        campaignData={campaignData}
                        enrolledCampaignsForSlot={enrolledCampaignsForSlot}
                        organizationForSlot={slotData.organizationForSlot}
                        isDisabled={slotData.isPastDay}
                        handleSetAvailable={wrappedHandleSetAvailable}
                        handleSetUnavailable={wrappedHandleSetUnavailable}
                        handleCancelConsultation={handleCancelConsultation}
                        handleViewProfile={handleViewProfile}
                        handleJoinConsultation={handleJoinConsultation}
                        handleProposeConsultation={() => {}}
                        validCampaigns={validCampaigns}
                        organizations={organizations}
                        t={t}
                        countryHasNormalSlots={countryHasNormalSlots}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
