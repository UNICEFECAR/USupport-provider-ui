import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Block,
  Grid,
  GridItem,
  Icon,
  ProviderAvailability,
  Loading,
} from "@USupport-components-library/src";

import {
  getDateView,
  getDatesInRange,
  getStartAndEndOfWeek,
  getTimestamp,
  getTimestampFromUTC,
  getDateAsFullString,
  isDateToday,
  hours,
  parseUTCDate,
} from "@USupport-components-library/src/utils/date";
import { useWindowDimensions } from "@USupport-components-library/utils";
import { providerSvc } from "@USupport-components-library/services";

import { useError, useGetProviderData } from "#hooks";

import "./scheduler.scss";

const namesOfDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * Scheduler
 *
 * Scheduler block
 *
 * @return {jsx}
 */
export const Scheduler = ({ openJoinConsultation, openCancelConsultation }) => {
  const { t } = useTranslation("scheduler");
  const navigate = useNavigate();
  const { width } = useWindowDimensions();

  const todayText = t("today");
  const today = new Date();
  const currentHourRef = useRef(null);

  const providerQuery = useGetProviderData()[0];
  const providerStatus = providerQuery?.data?.status;
  const organizations = providerQuery?.data?.organizations;

  const { first: startDate, last: endDate } = getStartAndEndOfWeek(today);
  const days = getDatesInRange(new Date(startDate), new Date(endDate));

  const [weekData, setWeekData] = useState({
    startDate,
    endDate,
    days,
  });

  const [slotsData, setSlots] = useState({
    slots: [],
    campaignSlots: [],
    organizationSlots: [],
  });
  const [consultations, setConsultations] = useState();
  const [validCampaigns, setValidCampaigns] = useState();

  // Get provider availability
  const fetchAvailableSlots = async () => {
    const response = await providerSvc.getAvailabilityForWeek(
      getTimestampFromUTC(weekData.startDate)
    );
    return response.data;
  };
  const availableSlotsQuery = useQuery(
    ["available-slots", weekData.startDate],
    fetchAvailableSlots,
    {
      onSuccess: (data) => {
        data.campaigns_data = data.campaigns_data?.map((x) => {
          return {
            campaignId: x.campaign_id,
            campaignName: x.campaign_name,
            couponCode: x.coupon_code,
            campaignStartDate: new Date(x.campaign_start_date),
            campaignEndDate: new Date(x.campaign_end_date),
            sponsorName: x.sponsor_name,
            sponsorImage: x.sponsor_image,
            active: x.active,
          };
        });

        const today = new Date().getTime();
        const campaigns = data.campaigns_data?.filter((x) => {
          return new Date(x.campaignEndDate).getTime() >= today && x.active;
        });
        setValidCampaigns(campaigns);

        setSlots({
          slots: data.slots,
          organizationSlots: [
            ...data.organization_slots.map((x) => ({
              time: parseUTCDate(x.time),
              organizationId: x.organization_id,
            })),
          ],
          campaignSlots: [
            ...data.campaign_slots.map((x) => ({
              time: parseUTCDate(x.time),
              campaignId: x.campaign_id,
            })),
          ],
        });
      },
    }
  );

  // Get provider availability
  const fetchConsultations = async () => {
    const response = await providerSvc.getConsultationsForWeek(
      getTimestampFromUTC(weekData.startDate)
    );
    return response.data;
  };
  const consultationQuery = useQuery(
    ["consultations-single-week", weekData.startDate],
    fetchConsultations,
    {
      onSuccess: (data) => {
        setConsultations(data);
      },
    }
  );

  // Add available slot mutation
  const addAvailableSlot = async ({
    startDate,
    timestampSlot,
    campaignId,
    organizationId,
  }) => {
    await providerSvc.addAvailableSlot(
      startDate,
      timestampSlot,
      campaignId,
      organizationId
    );
    return timestampSlot;
  };
  const addAvailableSlotMutation = useMutation(addAvailableSlot, {
    onMutate: ({ timestampSlot, campaignId, organizationId }) => {
      const newSlot = new Date(timestampSlot * 1000).toISOString();
      if (campaignId) {
        setSlots({
          slots: [...slotsData.slots],
          campaignSlots: [
            ...slotsData.campaignSlots,
            { campaignId, time: newSlot },
          ],
          organizationSlots: [...slotsData.organizationSlots],
        });
      } else if (organizationId) {
        setSlots({
          slots: [...slotsData.slots],
          campaignSlots: [...slotsData.campaignSlots],
          organizationSlots: [
            ...slotsData.organizationSlots,
            { organizationId, time: newSlot },
          ],
        });
      } else {
        setSlots({
          slots: [...slotsData.slots, newSlot],
          campaignSlots: [...slotsData.campaignSlots],
          organizationSlots: [...slotsData.organizationSlots],
        });
      }

      return () => {
        setSlots({
          slots: slotsData.slots.filter((slot) => slot !== newSlot),
          campaignSlots: [...slotsData.campaignSlots],
          organizationSlots: [...slotsData.organizationSlots],
        });
      };
    },
    onSuccess: () => {
      availableSlotsQuery.refetch();
      toast(t("slot_added"));
    },
    onError: (error, variables, rollback) => {
      rollback();
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
    },
  });

  // Remove available slot mutation
  const removeAvailableSlot = async ({
    startDate,
    timestampSlot,
    campaignId,
    organizationId,
  }) => {
    await providerSvc.removeAvailableSlot(
      startDate,
      timestampSlot,
      campaignId,
      organizationId
    );
    return timestampSlot;
  };
  const removeAvailableSlotMutation = useMutation(removeAvailableSlot, {
    onMutate: ({ timestampSlot, campaignId, organizationId }) => {
      const newSlot = new Date(timestampSlot * 1000).toISOString();
      if (campaignId) {
        setSlots({
          slots: [...slotsData.slots],
          campaignSlots: slotsData.campaignSlots.filter(
            (slot) => slot.time.toISOString() !== newSlot
          ),
          organizationSlots: [...slotsData.organizationSlots],
        });
      } else if (organizationId) {
        setSlots({
          slots: [...slotsData.slots],
          campaignSlots: [...slotsData.campaignSlots],
          organizationSlots: slotsData.organizationSlots.filter(
            (x) => x.time.toISOString() !== newSlot
          ),
        });
      } else {
        setSlots({
          slots: slotsData.slots.filter((slot) => slot !== newSlot),
          campaignSlots: [...slotsData.campaignSlots],
          organizationSlots: [...slotsData.organizationSlots],
        });
      }
    },
    onSuccess: () => {
      availableSlotsQuery.refetch();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
    },
  });

  const removeMultipleAvailableSlots = async ({
    startDate,
    slot,
    campaignIds,
    organizationId,
  }) => {
    await providerSvc.removeMultipleAvailableSlots(
      startDate,
      slot,
      campaignIds,
      organizationId
    );
    return true;
  };

  const removeMultipleAvailableSlotsMutation = useMutation(
    removeMultipleAvailableSlots,
    {
      onMutate: ({ slot, campaignIds, organizationId }) => {
        const slotToRemove = new Date(slot * 1000).toISOString();
        const oldSlots = { ...slotsData };

        const newOrganizationSlots = organizationId
          ? slotsData.organizationSlots.filter(
              (x) => x.time.toISOString() !== slotToRemove
            )
          : slotsData.organizationSlots;

        setSlots({
          slots: slotsData.slots.filter((slot) => slot !== slotToRemove),
          campaignSlots: slotsData.campaignSlots.filter((slot) => {
            if (
              new Date(slot.time).toISOString() === slotToRemove &&
              campaignIds.includes(slot.campaignId)
            ) {
              return false;
            }
            return true;
          }),
          organizationSlots: [...newOrganizationSlots],
        });
        return () => {
          setSlots(oldSlots);
        };
      },

      onSuccess: availableSlotsQuery.refetch,
      onError: (err, vars, rollback) => {
        rollback();
        const { message: errorMessage } = useError(err);
        toast(errorMessage, { type: "error" });
      },
    }
  );

  // When rendering every single slot check if
  // it exists in the provider's availability
  const checkIsAvailable = (date) => {
    const slot = slotsData.slots.find((slot) => {
      const dateStr = new Date(slot).toString();
      return dateStr === date;
    });
    const campaignSlots = slotsData.campaignSlots.filter((slot) => {
      const dateStr = new Date(slot.time).toString();
      return dateStr === date;
    });

    const campaignSlot = campaignSlots.find((singleSlot) => {
      const isSlotCampaignActive = validCampaigns?.find(
        (x) => x.campaignId === singleSlot?.campaignId && x.active
      );
      return isSlotCampaignActive;
    });

    const organizationSlots = slotsData.organizationSlots.filter((slot) => {
      const dateStr = new Date(slot.time).toString();
      return dateStr === date;
    });
    const organizationSlot = organizationSlots[0];
    const hasNormalSlot = !!slot;

    if (campaignSlot && organizationSlot) {
      return { campaignSlot, hasNormalSlot, organizationSlot };
    }
    if (organizationSlot) return { organizationSlot, hasNormalSlot };
    if (campaignSlot) return { campaignSlot, hasNormalSlot };
    return { slot, hasNormalSlot };
  };

  const getConsultation = (day, hour) => {
    const date = getDateAsFullString(day, hour);
    const consultation = consultations?.find((consultation) => {
      const dateStr = new Date(consultation.time).toString();
      return dateStr === date;
    });
    if (!consultation) return null;
    return {
      consultationId: consultation.consultation_id,
      clientDetailId: consultation.client_detail_id,
      chatId: consultation.chat_id,
      image: consultation.client_image,
      clientName: consultation.client_name,
      status: consultation.status,
      time: consultation.time,
      price: consultation.price,
      couponPrice: consultation.coupon_price,
      sponsorImage: consultation.sponsor_image,
      sponsorName: consultation.sponsor_name,
      campaignId: consultation.campaign_id,
      organizationId: consultation.organization_id,
    };
  };

  const handleToggleAvailable = async (
    date,
    hour,
    newStatus,
    campaignId,
    organizationId
  ) => {
    if (providerStatus === "inactive") {
      toast(t("provider_inactive"), { type: "error" });
      return;
    }
    const timestampSlot = getTimestamp(date, hour);

    const timestampStartDate = getTimestampFromUTC(weekData.startDate);
    const timestampEndDate = getTimestampFromUTC(weekData.endDate, "23:59");

    const timestampPreviousWeekStartDate = getTimestampFromUTC(
      new Date(
        new Date(weekData.startDate).setDate(weekData.startDate.getDate() - 7)
      )
    );
    const timestampPreviousWeekEndDate = getTimestampFromUTC(
      new Date(
        new Date(weekData.endDate).setDate(weekData.startDate.getDate() + 7)
      )
    );

    let startDate = timestampStartDate;

    if (timestampSlot < timestampStartDate) {
      startDate = timestampPreviousWeekStartDate;
    }

    if (timestampSlot > timestampEndDate) {
      startDate = timestampPreviousWeekEndDate;
    }
    if (newStatus === "available") {
      addAvailableSlotMutation.mutate({
        startDate,
        timestampSlot,
        campaignId,
        organizationId,
      });
    } else {
      if (Array.isArray(campaignId)) {
        removeMultipleAvailableSlotsMutation.mutate({
          startDate,
          slot: timestampSlot,
          campaignIds: campaignId,
          organizationId,
        });
      } else {
        removeAvailableSlotMutation.mutate({
          startDate,
          timestampSlot,
          campaignId,
          organizationId,
        });
      }
    }
  };

  const handleSetAvailable = (date, hour, campaignId, organizationId) => {
    handleToggleAvailable(date, hour, "available", campaignId, organizationId);
  };

  const handleSetUnavailable = (date, hour, campaignId, organizationId) => {
    handleToggleAvailable(
      date,
      hour,
      "unavailable",
      campaignId,
      organizationId
    );
  };

  const handleCancelConsultation = (consultation) => {
    openCancelConsultation(consultation);
  };

  const handleViewProfile = (consultation, isPast) => {
    navigate("/clients", {
      state: {
        clientInformation: {
          clientDetailId: consultation.clientDetailId,
          image: consultation.image,
          name: consultation.clientName,
        },
        consultationInformation: isPast ? consultation : null,
      },
    });
  };

  const handleJoinConsultation = (consultation) => {
    openJoinConsultation(consultation);
  };

  const handleWeekChange = (direction) => {
    if (direction === "next") {
      const nextWeek = getStartAndEndOfWeek(
        new Date(weekData.endDate.getTime() + 24 * 60 * 60 * 1000)
      );
      const weekDays = getDatesInRange(nextWeek.first, nextWeek.last);
      setWeekData({
        startDate: nextWeek.first,
        endDate: nextWeek.last,
        days: weekDays,
      });
    } else {
      const prevWeek = getStartAndEndOfWeek(
        new Date(weekData.startDate.getTime() - 24 * 60 * 60 * 1000)
      );
      const weekDays = getDatesInRange(prevWeek.first, prevWeek.last);
      setWeekData({
        startDate: prevWeek.first,
        endDate: prevWeek.last,
        days: weekDays,
      });
    }
  };

  const handleEditClick = () => {
    if (providerStatus !== "active") {
      toast(t("provider_inactive"), { type: "error" });
      return;
    }
    navigate("/calendar/template");
  };

  return (
    <>
      <Block classes="scheduler__heading-block">
        <Heading
          handleWeekChange={handleWeekChange}
          handleEditClick={handleEditClick}
          startDate={weekData.startDate}
          endDate={weekData.endDate}
          width={width}
          t={t}
        />
        <div className="scheduler__days-grid__days-of-week-item">
          <Grid classes="scheduler__days-grid__days-of-week-item__grid">
            {weekData.days.map((day, index) => {
              const isToday = isDateToday(day);
              const date = getDateView(day);
              const displayDate = width < 1366 ? date.slice(0, -3) : date;
              return (
                <React.Fragment key={"heading" + index}>
                  {index === 0 && <GridItem xs={1} />}
                  <GridItem xs={1}>
                    <div
                      className={[
                        "scheduler__day-of-week",
                        isToday ? "scheduler__day-of-week--today" : "",
                      ].join(" ")}
                    >
                      <p className="scheduler__day-of-week__day">
                        {isToday ? todayText : t(namesOfDays[day.getDay()])}
                      </p>
                      <p>{displayDate}</p>
                    </div>
                  </GridItem>
                </React.Fragment>
              );
            })}
          </Grid>
        </div>
      </Block>
      <Block classes="scheduler">
        {availableSlotsQuery.isLoading || consultationQuery.isLoading ? (
          <Loading />
        ) : (
          <>
            <Grid classes="scheduler__days-grid">
              {hours.map((hour, index) => {
                return (
                  <React.Fragment
                    key={"week" + hour.toString() + index.toString()}
                  >
                    <GridItem xs={1} classes="scheduler__days-grid__hour-item">
                      {hour === "07:00" && <div ref={currentHourRef} />}
                      <p className="small-text">{hour}</p>
                    </GridItem>
                    {weekData.days.map((day, dayIndex) => {
                      const slotDate = getDateAsFullString(day, hour);
                      const isAvailable = checkIsAvailable(slotDate);
                      const campaignId = isAvailable.campaignSlot?.campaignId;
                      const organizationId =
                        isAvailable.organizationSlot?.organizationId;

                      const organizationForSlot =
                        organizations?.find(
                          (x) => x.organizationId === organizationId
                        ) || null;

                      return (
                        <ProviderAvailability
                          key={"slot" + day.toString() + dayIndex.toString()}
                          isAvailable={
                            campaignId
                              ? "campaign"
                              : organizationId
                              ? "organization"
                              : !!isAvailable.slot
                          }
                          hasNormalSlot={isAvailable.hasNormalSlot}
                          handleSetUnavailable={({
                            campaignId,
                            organizationId,
                          }) => {
                            handleSetUnavailable(
                              day,
                              hour,
                              campaignId,
                              organizationId
                            );
                          }}
                          handleSetAvailable={({
                            campaignId,
                            organizationId,
                          }) => {
                            handleSetAvailable(
                              day,
                              hour,
                              campaignId,
                              organizationId
                            );
                          }}
                          handleCancelConsultation={handleCancelConsultation}
                          handleViewProfile={handleViewProfile}
                          handleJoinConsultation={handleJoinConsultation}
                          consultation={getConsultation(day, hour)}
                          campaignData={
                            campaignId
                              ? validCampaigns.find(
                                  (x) => x.campaignId === campaignId
                                )
                              : null
                          }
                          enrolledCampaignsForSlot={
                            campaignId
                              ? slotsData?.campaignSlots?.filter((x) => {
                                  return (
                                    new Date(x.time).toString() === slotDate
                                  );
                                })
                              : []
                          }
                          validCampaigns={validCampaigns}
                          organizations={organizations}
                          organizationForSlot={organizationForSlot}
                          dayIndex={dayIndex}
                          slot={slotDate}
                          t={t}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </Grid>
          </>
        )}
      </Block>
    </>
  );
};

const Heading = ({
  handleWeekChange,
  startDate,
  endDate,
  width,
  t,
  handleEditClick,
}) => {
  return (
    <Grid classes="scheduler__heading-grid">
      <GridItem md={8} lg={12}>
        <Grid>
          <GridItem xs={2} md={2}>
            <h3>{t("calendar")}</h3>
          </GridItem>
          <GridItem
            xs={2}
            md={2}
            classes="scheduler__heading-grid__edit"
            onClick={handleEditClick}
          >
            <Icon color="#9749FA" name="calendar" />
            <p className="small-text">{t("add_template_availability")}</p>
          </GridItem>
          <GridItem md={4} lg={8}>
            <ChangeWeek
              startDate={startDate}
              endDate={endDate}
              handleWeekChange={handleWeekChange}
              width={width}
            />
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};

const ChangeWeek = ({ startDate, endDate, handleWeekChange, width }) => {
  return (
    <div className="scheduler__change-week">
      <Icon
        color="#9749FA"
        name="arrow-chevron-back"
        size={width < 768 ? "lg" : "md"}
        onClick={() => handleWeekChange("previous")}
      />
      <div className="scheduler__change-week__date">
        <p className="text">
          {getDateView(startDate)} - {getDateView(endDate)}
        </p>
      </div>
      <Icon
        color="#9749FA"
        name="arrow-chevron-forward"
        size={width < 768 ? "lg" : "md"}
        onClick={() => handleWeekChange("next")}
      />
    </div>
  );
};
