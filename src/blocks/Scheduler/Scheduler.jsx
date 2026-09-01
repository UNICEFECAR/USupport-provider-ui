import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import { toast } from "react-toastify";
import {
  Block,
  Grid,
  GridItem,
  ProviderAvailability,
  DailyAvailabilitySlot,
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
} from "@USupport-components-library/src/utils/date";
import { useWindowDimensions } from "@USupport-components-library/utils";
import { providerSvc } from "@USupport-components-library/services";

import { useError, useGetProviderData } from "#hooks";

import { SchedulerToolbar } from "./SchedulerToolbar.jsx";
import { SchedulerMonthView } from "./SchedulerMonthView.jsx";
import { ScheduleOverviewMonthCalendar } from "./ScheduleOverviewMonthCalendar.jsx";
import { ScheduleOverviewWeekCalendar } from "./ScheduleOverviewWeekCalendar.jsx";
import { ScheduleOverviewWeekGrid } from "./ScheduleOverviewWeekGrid.jsx";
import { ScheduleDaySlotsModal } from "./ScheduleDaySlotsModal.jsx";
import { ScheduleDaySlotsPanel } from "./ScheduleDaySlotsPanel.jsx";
import {
  getUniqueWeekStartsInMonth,
  mergeConsultationResponses,
  normalizeAvailabilityResponse,
  mapSlotDataForDailyComponent,
} from "./schedulerUtils.js";

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
export const Scheduler = ({
  openJoinConsultation,
  openCancelConsultation,
  variant = "default",
  defaultPeriod = "day",
}) => {
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "scheduler" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { width } = useWindowDimensions();
  const countryHasNormalSlots =
    localStorage.getItem("has_normal_slots") === "true";

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
  const pendingSlotWrites = useRef(0);
  const [validCampaigns, setValidCampaigns] = useState();

  const [monthViewDate, setMonthViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [monthSelectedDay, setMonthSelectedDay] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });

  const [periodTypes, setPeriodTypes] = useState([
    {
      label: t("day"),
      value: "day",
      isSelected: defaultPeriod === "day",
    },
    {
      label: t("week"),
      value: "week",
      isSelected: defaultPeriod === "week",
    },
    {
      label: t("month"),
      value: "month",
      isSelected: defaultPeriod === "month",
    },
  ]);

  const [selectedDay, setSelectedDay] = useState(today);
  const [slotsModalDay, setSlotsModalDay] = useState(null);

  const selectedPeriod = periodTypes.find((p) => p.isSelected)?.value || "day";
  const overviewDayUsesWeekData =
    variant === "overview" && selectedPeriod === "day";
  const usesWeekAvailability =
    selectedPeriod === "week" || overviewDayUsesWeekData;
  const usesWeekConsultations =
    selectedPeriod === "week" || overviewDayUsesWeekData;

  useEffect(() => {
    if (!overviewDayUsesWeekData) return;
    const { first, last } = getStartAndEndOfWeek(selectedDay);
    setWeekData({
      startDate: first,
      endDate: last,
      days: getDatesInRange(first, last),
    });
  }, [overviewDayUsesWeekData, selectedDay]);

  const handlePeriodTypesChange = (newOptions) => {
    const next = newOptions.find((x) => x.isSelected)?.value;
    const prev = selectedPeriod;
    setPeriodTypes(newOptions);

    if (next === "week" && prev !== "week") {
      const anchor = prev === "month" ? monthSelectedDay : selectedDay;
      const { first, last } = getStartAndEndOfWeek(anchor);
      setWeekData({
        startDate: first,
        endDate: last,
        days: getDatesInRange(first, last),
      });
    }

    if (next === "month" && prev !== "month") {
      const anchor = prev === "week" ? weekData.startDate : selectedDay;
      const mv = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      setMonthViewDate(mv);
      const todayD = new Date();
      if (
        todayD.getFullYear() === mv.getFullYear() &&
        todayD.getMonth() === mv.getMonth()
      ) {
        setMonthSelectedDay(
          new Date(todayD.getFullYear(), todayD.getMonth(), todayD.getDate()),
        );
      } else {
        setMonthSelectedDay(new Date(mv.getFullYear(), mv.getMonth(), 1));
      }
    }

    if (next === "day" && prev === "month") {
      setSelectedDay(new Date(monthSelectedDay));
    }
  };

  const monthAvailabilityStart = useMemo(
    () => new Date(monthViewDate.getFullYear(), monthViewDate.getMonth(), 1),
    [monthViewDate],
  );

  const availabilityStaleTime = 60_000;

  const availabilityDayQuery = useQuery(
    ["available-slots", "day", selectedDay.getTime()],
    () =>
      providerSvc
        .getAvailabilityForPeriod(getTimestampFromUTC(selectedDay), "day")
        .then((r) => r.data),
    {
      enabled: selectedPeriod === "day" && !overviewDayUsesWeekData,
      staleTime: availabilityStaleTime,
    },
  );

  const weekQueryStartDate = useMemo(() => {
    if (overviewDayUsesWeekData) {
      return getStartAndEndOfWeek(selectedDay).first;
    }
    return weekData.startDate;
  }, [overviewDayUsesWeekData, selectedDay, weekData.startDate]);

  const overviewWeekDays = useMemo(() => {
    if (variant !== "overview") {
      return weekData.days;
    }
    const anchor = selectedPeriod === "day" ? selectedDay : weekData.startDate;
    const { first, last } = getStartAndEndOfWeek(anchor);
    return getDatesInRange(first, last);
  }, [variant, selectedPeriod, selectedDay, weekData.startDate, weekData.days]);

  const dayViewWeekDays = useMemo(() => {
    const { first, last } = getStartAndEndOfWeek(selectedDay);
    return getDatesInRange(first, last);
  }, [selectedDay]);

  const availabilityWeekQuery = useQuery(
    ["available-slots", "week", weekQueryStartDate.getTime()],
    () =>
      providerSvc
        .getAvailabilityForPeriod(
          getTimestampFromUTC(weekQueryStartDate),
          "week",
        )
        .then((r) => r.data),
    {
      enabled: usesWeekAvailability,
      staleTime: availabilityStaleTime,
    },
  );

  const availabilityMonthQuery = useQuery(
    [
      "available-slots",
      "month",
      monthViewDate.getFullYear(),
      monthViewDate.getMonth(),
    ],
    () =>
      providerSvc
        .getAvailabilityForPeriod(
          getTimestampFromUTC(monthAvailabilityStart),
          "month",
        )
        .then((r) => r.data),
    {
      enabled: selectedPeriod === "month",
      staleTime: availabilityStaleTime,
    },
  );

  useEffect(() => {
    const raw = usesWeekAvailability
      ? availabilityWeekQuery.data
      : selectedPeriod === "day"
        ? availabilityDayQuery.data
        : availabilityMonthQuery.data;
    if (raw == null) return;
    if (pendingSlotWrites.current > 0) return;
    const { validCampaigns: vc, slotsState } =
      normalizeAvailabilityResponse(raw);
    setValidCampaigns(vc);
    setSlots(slotsState);
  }, [
    usesWeekAvailability,
    selectedPeriod,
    availabilityDayQuery.data,
    availabilityWeekQuery.data,
    availabilityMonthQuery.data,
  ]);

  const slotsLoading = usesWeekAvailability
    ? availabilityWeekQuery.isLoading
    : selectedPeriod === "day"
      ? availabilityDayQuery.isLoading
      : availabilityMonthQuery.isLoading;

  const invalidateAvailabilityQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["available-slots"] });
  };

  const dayConsultationsQuery = useQuery(
    ["consultations", "day", selectedDay.getTime()],
    () =>
      providerSvc
        .getConsultationsForSingleDay(getTimestampFromUTC(selectedDay))
        .then((r) => r.data),
    {
      enabled: selectedPeriod === "day",
    },
  );

  const weekConsultationsQuery = useQuery(
    ["consultations", "week", weekQueryStartDate.getTime()],
    () =>
      providerSvc
        .getConsultationsForWeek(getTimestampFromUTC(weekQueryStartDate))
        .then((r) => r.data),
    {
      enabled: usesWeekConsultations,
    },
  );

  const weekStartsForMonth = useMemo(() => {
    if (selectedPeriod !== "month") return [];
    return getUniqueWeekStartsInMonth(monthViewDate);
  }, [selectedPeriod, monthViewDate]);

  const monthConsultationQueries = useQueries({
    queries: weekStartsForMonth.map((ws) => ({
      queryKey: ["consultations-month", ws.getTime()],
      queryFn: () =>
        providerSvc
          .getConsultationsForWeek(getTimestampFromUTC(ws))
          .then((r) => r.data),
      enabled: selectedPeriod === "month",
      staleTime: 30_000,
    })),
  });

  const mergedMonthConsultations = mergeConsultationResponses(
    monthConsultationQueries.map((q) => q.data),
  );

  const consultations = usesWeekConsultations
    ? weekConsultationsQuery.data
    : selectedPeriod === "day"
      ? dayConsultationsQuery.data
      : mergedMonthConsultations;

  const consultationsLoading = usesWeekConsultations
    ? weekConsultationsQuery.isLoading
    : selectedPeriod === "day"
      ? dayConsultationsQuery.isLoading
      : monthConsultationQueries.some((q) => q.isLoading);

  const invalidateConsultationQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["consultations"] });
    queryClient.invalidateQueries({ queryKey: ["consultations-month"] });
  };

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
      organizationId,
    );
    return timestampSlot;
  };
  const addAvailableSlotMutation = useMutation(addAvailableSlot, {
    onMutate: ({ timestampSlot, campaignId, organizationId }) => {
      const newSlotDate = new Date(timestampSlot * 1000);
      const newSlot = newSlotDate.toISOString();
      const previous = slotsData;
      pendingSlotWrites.current += 1;
      setSlots((prev) => {
        if (campaignId) {
          return {
            ...prev,
            campaignSlots: [
              ...prev.campaignSlots,
              { campaignId, time: newSlotDate },
            ],
          };
        }
        if (organizationId) {
          const slotMs = newSlotDate.getTime();
          return {
            ...prev,
            organizationSlots: [
              ...prev.organizationSlots.filter(
                (slot) => new Date(slot.time).getTime() !== slotMs,
              ),
              { organizationId, time: newSlotDate },
            ],
          };
        }
        return {
          ...prev,
          slots: [...prev.slots, newSlot],
        };
      });

      return () => {
        setSlots(previous);
      };
    },
    onSuccess: () => {
      invalidateAvailabilityQueries();
      invalidateConsultationQueries();
      toast(t("slot_added"));
    },
    onError: (error, variables, rollback) => {
      rollback();
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
    },
    onSettled: () => {
      pendingSlotWrites.current = Math.max(0, pendingSlotWrites.current - 1);
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
      organizationId,
    );
    return timestampSlot;
  };
  const removeAvailableSlotMutation = useMutation(removeAvailableSlot, {
    onMutate: ({ timestampSlot, campaignId, organizationId }) => {
      const newSlotDate = new Date(timestampSlot * 1000);
      const newSlot = newSlotDate.toISOString();
      const slotMs = newSlotDate.getTime();
      pendingSlotWrites.current += 1;
      setSlots((prev) => {
        if (campaignId) {
          return {
            ...prev,
            campaignSlots: prev.campaignSlots.filter(
              (slot) =>
                !(
                  new Date(slot.time).getTime() === slotMs &&
                  slot.campaignId === campaignId
                ),
            ),
          };
        }
        if (organizationId) {
          return {
            ...prev,
            organizationSlots: prev.organizationSlots.filter(
              (slot) =>
                !(
                  new Date(slot.time).getTime() === slotMs &&
                  slot.organizationId === organizationId
                ),
            ),
          };
        }
        return {
          ...prev,
          slots: prev.slots.filter((slot) => {
            const value = slot instanceof Date ? slot.toISOString() : slot;
            return value !== newSlot && new Date(slot).getTime() !== slotMs;
          }),
        };
      });
    },
    onSuccess: () => {
      invalidateAvailabilityQueries();
      invalidateConsultationQueries();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
    },
    onSettled: () => {
      pendingSlotWrites.current = Math.max(0, pendingSlotWrites.current - 1);
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
      organizationId,
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
              (x) => x.time.toISOString() !== slotToRemove,
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

      onSuccess: () => {
        invalidateAvailabilityQueries();
        invalidateConsultationQueries();
      },
      onError: (err, vars, rollback) => {
        rollback();
        const { message: errorMessage } = useError(err);
        toast(errorMessage, { type: "error" });
      },
    },
  );

  // When rendering every single slot check if
  // it exists in the provider's availability
  const checkIsAvailable = (date) => {
    // Convert date string to Date object for comparison
    const targetDate = new Date(date);
    const targetTime = targetDate.getTime();

    const slot = slotsData.slots.find((slot) => {
      const slotDate = new Date(slot);
      return slotDate.getTime() === targetTime;
    });
    const campaignSlots = slotsData.campaignSlots.filter((slot) => {
      const slotDate = new Date(slot.time);
      return slotDate.getTime() === targetTime;
    });

    const campaignSlot = campaignSlots.find((singleSlot) => {
      const isSlotCampaignActive = validCampaigns?.find(
        (x) => x.campaignId === singleSlot?.campaignId && x.active,
      );
      return isSlotCampaignActive;
    });

    const organizationSlots = slotsData.organizationSlots.filter((slot) => {
      const slotDate = new Date(slot.time);
      return slotDate.getTime() === targetTime;
    });
    const organizationSlot = organizationSlots[0] || null;
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
    organizationId,
  ) => {
    if (providerStatus === "inactive") {
      toast(t("provider_inactive"), { type: "error" });
      return;
    }
    const timestampSlot = getTimestamp(date, hour);

    const dateForSlot = selectedPeriod === "day" ? selectedDay : date;
    const { first: weekStartDate } = getStartAndEndOfWeek(dateForSlot);
    const timestampStartDate = getTimestampFromUTC(weekStartDate);
    const timestampEndDate = getTimestampFromUTC(
      getStartAndEndOfWeek(dateForSlot).last,
      "23:59",
    );

    const timestampPreviousWeekStartDate = getTimestampFromUTC(
      new Date(new Date(weekStartDate).setDate(weekStartDate.getDate() - 7)),
    );
    const timestampPreviousWeekEndDate = getTimestampFromUTC(
      new Date(new Date(weekStartDate).setDate(weekStartDate.getDate() + 7)),
      "23:59",
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
      organizationId,
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

  const handleDateSelect = (date) => {
    const picked = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (selectedPeriod === "day") {
      setSelectedDay(picked);
      return;
    }

    if (selectedPeriod === "week") {
      const { first, last } = getStartAndEndOfWeek(picked);
      setWeekData({
        startDate: first,
        endDate: last,
        days: getDatesInRange(first, last),
      });
      return;
    }

    const monthAnchor = new Date(picked.getFullYear(), picked.getMonth(), 1);
    setMonthViewDate(monthAnchor);
    setMonthSelectedDay(picked);
  };

  const handleMonthSelect = (monthAnchor) => {
    setMonthViewDate(monthAnchor);
    const todayD = new Date();
    if (
      todayD.getFullYear() === monthAnchor.getFullYear() &&
      todayD.getMonth() === monthAnchor.getMonth()
    ) {
      setMonthSelectedDay(
        new Date(todayD.getFullYear(), todayD.getMonth(), todayD.getDate()),
      );
    } else {
      setMonthSelectedDay(
        new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1),
      );
    }
  };

  const handleOverviewMonthDaySelect = (date) => {
    const picked = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    if (
      picked.getMonth() !== monthViewDate.getMonth() ||
      picked.getFullYear() !== monthViewDate.getFullYear()
    ) {
      setMonthViewDate(new Date(picked.getFullYear(), picked.getMonth(), 1));
    }
    setMonthSelectedDay(picked);
  };

  const toolbarSelectedDate =
    selectedPeriod === "day"
      ? selectedDay
      : selectedPeriod === "week"
        ? weekData.startDate
        : monthSelectedDay;

  const handleDateChange = (direction) => {
    if (selectedPeriod === "day") {
      const newDate = new Date(selectedDay);
      if (direction === "next") {
        newDate.setDate(newDate.getDate() + 1);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
      setSelectedDay(newDate);
      return;
    }
    if (selectedPeriod === "month") {
      const nd = new Date(monthViewDate);
      nd.setMonth(nd.getMonth() + (direction === "next" ? 1 : -1));
      setMonthViewDate(nd);
      const todayD = new Date();
      if (
        todayD.getFullYear() === nd.getFullYear() &&
        todayD.getMonth() === nd.getMonth()
      ) {
        setMonthSelectedDay(
          new Date(todayD.getFullYear(), todayD.getMonth(), todayD.getDate()),
        );
      } else {
        setMonthSelectedDay(new Date(nd.getFullYear(), nd.getMonth(), 1));
      }
      return;
    }
    handleWeekChange(direction);
  };

  const handleWeekChange = (direction) => {
    if (direction === "next") {
      const nextWeek = getStartAndEndOfWeek(
        new Date(weekData.endDate.getTime() + 24 * 60 * 60 * 1000),
      );
      const weekDays = getDatesInRange(nextWeek.first, nextWeek.last);
      setWeekData({
        startDate: nextWeek.first,
        endDate: nextWeek.last,
        days: weekDays,
      });
    } else {
      const prevWeek = getStartAndEndOfWeek(
        new Date(weekData.startDate.getTime() - 24 * 60 * 60 * 1000),
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

  const getSlotDataForHour = (hour, day = selectedDay) => {
    const slotDate = getDateAsFullString(day, hour);
    const isAvailable = checkIsAvailable(slotDate);
    const campaignId = isAvailable.campaignSlot?.campaignId;
    const organizationId = isAvailable.organizationSlot?.organizationId;
    const slotDateTime = new Date(slotDate).getTime();
    const now = new Date().getTime();
    const isPastDay = slotDateTime < now;
    const consultation = getConsultation(day, hour);

    const organizationForSlot =
      organizations?.find((x) => x.organizationId === organizationId) || null;

    // Get all campaign slots for this hour
    const targetTime = new Date(slotDate).getTime();
    const campaignSlotsForHour =
      slotsData?.campaignSlots?.filter((x) => {
        return new Date(x.time).getTime() === targetTime;
      }) || [];
    const organizationSlotsForHour =
      slotsData?.organizationSlots?.filter((x) => {
        return new Date(x.time).getTime() === targetTime;
      }) || [];

    const slots = [];

    // If there's a consultation, return booked slot
    if (consultation) {
      slots.push({
        slotDate,
        availabilityStatus: "booked",
        isAvailable: !!isAvailable.slot,
        hasNormalSlot: isAvailable.hasNormalSlot,
        campaignId,
        organizationId,
        organizationForSlot,
        campaignSlots: campaignSlotsForHour.map((campaignSlot) => ({
          campaignId: campaignSlot.campaignId,
          campaignData: validCampaigns?.find(
            (x) => x.campaignId === campaignSlot.campaignId,
          ),
        })),
        consultation,
        isPastDay,
      });
      return slots;
    }

    if (isAvailable.slot || isAvailable.hasNormalSlot) {
      slots.push({
        slotDate,
        availabilityStatus: "available",
        isAvailable: !!isAvailable.slot,
        hasNormalSlot: isAvailable.hasNormalSlot,
        campaignId: null,
        organizationId: null,
        organizationForSlot: null,
        campaignSlots: campaignSlotsForHour.map((campaignSlot) => ({
          campaignId: campaignSlot.campaignId,
          campaignData: validCampaigns?.find(
            (x) => x.campaignId === campaignSlot.campaignId,
          ),
        })),
        consultation: null,
        isPastDay,
      });
    }

    campaignSlotsForHour.forEach((campaignSlot) => {
      slots.push({
        slotDate,
        availabilityStatus: "campaign",
        isAvailable: false,
        hasNormalSlot: isAvailable.hasNormalSlot,
        campaignId: campaignSlot.campaignId,
        organizationId: null,
        organizationForSlot: null,
        campaignSlots: [],
        consultation: null,
        isPastDay,
      });
    });

    organizationSlotsForHour.forEach((orgSlot) => {
      slots.push({
        slotDate,
        availabilityStatus: "organization",
        isAvailable: false,
        hasNormalSlot: isAvailable.hasNormalSlot,
        campaignId: null,
        organizationId: orgSlot.organizationId,
        organizationForSlot:
          organizations?.find(
            (x) => x.organizationId === orgSlot.organizationId,
          ) || null,
        campaignSlots: [],
        consultation: null,
        isPastDay,
      });
    });

    // If no slots, return unavailable slot
    if (slots.length === 0) {
      slots.push({
        slotDate,
        availabilityStatus: "unavailable",
        isAvailable: false,
        hasNormalSlot: false,
        campaignId: null,
        organizationId: null,
        organizationForSlot: null,
        campaignSlots: [],
        consultation: null,
        isPastDay,
      });
    }

    return slots;
  };

  const toolbarDateLabel = (() => {
    if (selectedPeriod === "day") {
      return isDateToday(selectedDay) ? t("today") : getDateView(selectedDay);
    }
    if (selectedPeriod === "week") {
      return `${getDateView(weekData.startDate)} – ${getDateView(
        weekData.endDate,
      )}`;
    }
    return monthViewDate.toLocaleDateString(i18n.language, {
      month: "long",
      year: "numeric",
    });
  })();

  const monthListTitle =
    isDateToday(monthSelectedDay) &&
    monthSelectedDay.getMonth() === monthViewDate.getMonth() &&
    monthSelectedDay.getFullYear() === monthViewDate.getFullYear()
      ? t("appointments_today")
      : t("appointments_for_date", {
          date: monthSelectedDay.toLocaleDateString(i18n.language, {
            weekday: "short",
            day: "numeric",
            month: "short",
          }),
        });

  const dataLoading = slotsLoading || consultationsLoading;

  const toolbar = (
    <SchedulerToolbar
      periodTypes={periodTypes}
      onPeriodChange={handlePeriodTypesChange}
      dateLabel={toolbarDateLabel}
      selectedPeriod={selectedPeriod}
      selectedDate={toolbarSelectedDate}
      monthViewDate={monthViewDate}
      weekDays={
        selectedPeriod === "week" || overviewDayUsesWeekData
          ? overviewWeekDays
          : []
      }
      onDateSelect={handleDateSelect}
      onMonthSelect={handleMonthSelect}
      onPrev={() => handleDateChange("previous")}
      onNext={() => handleDateChange("next")}
      onAddAvailabilityTemplate={handleEditClick}
      width={width}
      addAvailabilityTemplateLabel={t("add_template_availability")}
      t={t}
      language={i18n.language}
    />
  );

  if (variant === "overview") {
    const overviewConsultationsRaw = Array.isArray(consultations)
      ? consultations
      : [];
    const overviewWeekCalendarProps = {
      days: overviewWeekDays,
      consultationsRaw: overviewConsultationsRaw,
      hours,
      getSlotDataForHour,
      t,
    };
    const overviewSlotsPanelProps = {
      hours,
      getSlotDataForHour,
      handleSetAvailable,
      handleSetUnavailable,
      slotsData,
      organizations,
      validCampaigns,
      countryHasNormalSlots,
      isLoading: dataLoading,
      t,
    };

    return (
      <div className="scheduler scheduler--overview">
        <div className="scheduler__overview-header">
          <h3 className="scheduler__overview-title">
            {t("schedule_and_availability")}
          </h3>
          {toolbar}
        </div>
        <div className="scheduler__overview-body">
          {selectedPeriod === "day" ? (
            <>
              <ScheduleOverviewWeekCalendar
                {...overviewWeekCalendarProps}
                selectedDay={selectedDay}
                onSelectDay={(date) => {
                  setSelectedDay(
                    new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                    ),
                  );
                }}
              />
              {dataLoading ? (
                <Loading size="md" />
              ) : (
                <div className="schedule-overview-day-slots">
                  <ScheduleDaySlotsPanel
                    {...overviewSlotsPanelProps}
                    day={selectedDay}
                  />
                </div>
              )}
            </>
          ) : dataLoading ? (
            <Loading />
          ) : selectedPeriod === "week" ? (
            <ScheduleOverviewWeekGrid
              days={overviewWeekDays}
              hours={hours}
              getSlotDataForHour={getSlotDataForHour}
              handleSetAvailable={handleSetAvailable}
              handleSetUnavailable={handleSetUnavailable}
              slotsData={slotsData}
              organizations={organizations}
              validCampaigns={validCampaigns}
              countryHasNormalSlots={countryHasNormalSlots}
              consultationsRaw={overviewConsultationsRaw}
              t={t}
            />
          ) : (
            <ScheduleOverviewMonthCalendar
              monthViewDate={monthViewDate}
              monthSelectedDay={monthSelectedDay}
              onSelectDay={handleOverviewMonthDaySelect}
              onOpenDaySlots={setSlotsModalDay}
              consultationsRaw={overviewConsultationsRaw}
              hours={hours}
              getSlotDataForHour={getSlotDataForHour}
              t={t}
            />
          )}
        </div>
        <ScheduleDaySlotsModal
          isOpen={!!slotsModalDay}
          day={slotsModalDay}
          onClose={() => setSlotsModalDay(null)}
          hours={hours}
          getSlotDataForHour={getSlotDataForHour}
          handleSetAvailable={handleSetAvailable}
          handleSetUnavailable={handleSetUnavailable}
          slotsData={slotsData}
          organizations={organizations}
          validCampaigns={validCampaigns}
          countryHasNormalSlots={countryHasNormalSlots}
          language={i18n.language}
          isLoading={dataLoading}
          t={t}
        />
      </div>
    );
  }

  return (
    <>
      <Block classes="scheduler__heading" animation={null}>
        <div className="scheduler__heading-inner">
          {toolbar}
          {selectedPeriod === "day" && (
            <div className="scheduler__weekday-strip scheduler__weekday-strip--day">
              <Grid classes="scheduler__weekday-strip__grid">
                <GridItem xs={1} classes="scheduler__weekday-strip__spacer" />
                {dayViewWeekDays.map((day, index) => {
                  const isToday = isDateToday(day);
                  const isActive =
                    day.toDateString() === selectedDay.toDateString();
                  const date = getDateView(day);
                  const displayDate = width < 1366 ? date.slice(0, -3) : date;
                  return (
                    <GridItem xs={1} key={`day-strip-${index}`}>
                      <button
                        type="button"
                        className={[
                          "scheduler__day-of-week",
                          "scheduler__day-of-week--clickable",
                          isToday ? "scheduler__day-of-week--today" : "",
                          isActive ? "scheduler__day-of-week--active" : "",
                        ].join(" ")}
                        onClick={() =>
                          setSelectedDay(
                            new Date(
                              day.getFullYear(),
                              day.getMonth(),
                              day.getDate(),
                            ),
                          )
                        }
                      >
                        <p className="scheduler__day-of-week__day">
                          {t(namesOfDays[day.getDay()])}
                        </p>
                        <p
                          className={[
                            "scheduler__day-of-week__date-text",
                            isToday
                              ? "scheduler__day-of-week__date-text--today"
                              : "",
                          ].join(" ")}
                        >
                          {displayDate}
                        </p>
                      </button>
                    </GridItem>
                  );
                })}
              </Grid>
            </div>
          )}
          {selectedPeriod === "week" && (
            <div className="scheduler__weekday-strip">
              <Grid classes="scheduler__weekday-strip__grid">
                <GridItem xs={1} classes="scheduler__weekday-strip__spacer" />
                {weekData.days.map((day, index) => {
                  const isToday = isDateToday(day);
                  const date = getDateView(day);
                  const displayDate = width < 1366 ? date.slice(0, -3) : date;
                  return (
                    <GridItem xs={1} key={`weekday-${index}`}>
                      <div
                        className={[
                          "scheduler__day-of-week",
                          isToday ? "scheduler__day-of-week--today" : "",
                        ].join(" ")}
                      >
                        <p className="scheduler__day-of-week__day">
                          {t(namesOfDays[day.getDay()])}
                        </p>
                        <p
                          className={[
                            "scheduler__day-of-week__date-text",
                            isToday
                              ? "scheduler__day-of-week__date-text--today"
                              : "",
                          ].join(" ")}
                        >
                          {displayDate}
                        </p>
                      </div>
                    </GridItem>
                  );
                })}
              </Grid>
            </div>
          )}
        </div>
      </Block>
      <Block classes="scheduler">
        <div className="scheduler__surface">
          {dataLoading ? (
            <Loading />
          ) : selectedPeriod === "day" ? (
            <DailyView
              selectedDay={selectedDay}
              hours={hours}
              getSlotDataForHour={getSlotDataForHour}
              handleSetAvailable={handleSetAvailable}
              handleSetUnavailable={handleSetUnavailable}
              handleCancelConsultation={handleCancelConsultation}
              handleViewProfile={handleViewProfile}
              handleJoinConsultation={handleJoinConsultation}
              handleProposeConsultation={() => {}}
              validCampaigns={validCampaigns}
              organizations={organizations}
              t={t}
              countryHasNormalSlots={countryHasNormalSlots}
            />
          ) : selectedPeriod === "week" ? (
            <Grid classes="scheduler__days-grid">
              {hours.map((hour, index) => {
                return (
                  <React.Fragment
                    key={"week" + hour.toString() + index.toString()}
                  >
                    <GridItem xs={1} classes="scheduler__days-grid__hour-item">
                      {hour === "07:00" && <div ref={currentHourRef} />}
                      <p className="scheduler__days-grid__hour-item__text">
                        {hour}
                      </p>
                    </GridItem>
                    {weekData.days.map((day, dayIndex) => {
                      const slotDate = getDateAsFullString(day, hour);
                      const isAvailable = checkIsAvailable(slotDate);
                      const campaignId = isAvailable.campaignSlot?.campaignId;
                      const organizationId =
                        isAvailable.organizationSlot?.organizationId;
                      const isPastDay = new Date(slotDate) < new Date();

                      const organizationForSlot =
                        organizations?.find(
                          (x) => x.organizationId === organizationId,
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
                            campaignId: cId,
                            organizationId: oId,
                          }) => {
                            handleSetUnavailable(day, hour, cId, oId);
                          }}
                          handleSetAvailable={({
                            campaignId: cId,
                            organizationId: oId,
                          }) => {
                            handleSetAvailable(day, hour, cId, oId);
                          }}
                          handleCancelConsultation={handleCancelConsultation}
                          handleViewProfile={handleViewProfile}
                          handleJoinConsultation={handleJoinConsultation}
                          consultation={getConsultation(day, hour)}
                          campaignData={
                            campaignId
                              ? validCampaigns?.find(
                                  (x) => x.campaignId === campaignId,
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
                          isDisabled={isPastDay}
                          t={t}
                          countryHasNormalSlots={countryHasNormalSlots}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </Grid>
          ) : (
            <SchedulerMonthView
              monthViewDate={monthViewDate}
              monthSelectedDay={monthSelectedDay}
              onSelectDay={setMonthSelectedDay}
              consultationsRaw={
                Array.isArray(consultations) ? consultations : []
              }
              listTitle={monthListTitle}
              hours={hours}
              getSlotDataForHour={getSlotDataForHour}
              handleSetAvailable={handleSetAvailable}
              handleSetUnavailable={handleSetUnavailable}
              handleViewProfile={handleViewProfile}
              handleCancelConsultation={handleCancelConsultation}
              handleJoinConsultation={handleJoinConsultation}
              validCampaigns={validCampaigns}
              organizations={organizations}
              countryHasNormalSlots={countryHasNormalSlots}
              language={i18n.language}
              t={t}
            />
          )}
        </div>
      </Block>
    </>
  );
};

const DailyView = ({
  selectedDay,
  hours,
  getSlotDataForHour,
  handleSetAvailable,
  handleSetUnavailable,
  handleCancelConsultation,
  handleViewProfile,
  handleJoinConsultation,
  handleProposeConsultation,
  validCampaigns,
  organizations,
  t,
  countryHasNormalSlots,
}) => {
  let firstBookedHour = null;
  for (const h of hours) {
    const rows = getSlotDataForHour(h);
    if (rows?.some((s) => s.consultation)) {
      firstBookedHour = h;
      break;
    }
  }

  return (
    <div className="scheduler__daily-view">
      {hours.map((hour, index) => {
        const slots = getSlotDataForHour(hour);
        if (!slots || slots.length === 0) return null;

        const now = new Date();
        const isToday = isDateToday(selectedDay);
        const currentHourString = `${String(now.getHours()).padStart(
          2,
          "0",
        )}:00`;
        const isCurrentHour = isToday && hour === currentHourString;

        const wrappedHandleSetAvailable = ({ campaignId, organizationId }) => {
          handleSetAvailable(selectedDay, hour, campaignId, organizationId);
        };
        const wrappedHandleSetUnavailable = ({
          campaignId,
          organizationId,
        }) => {
          handleSetUnavailable(selectedDay, hour, campaignId, organizationId);
        };

        return (
          <div
            key={`daily-hour-${hour}-${index}`}
            className="scheduler__daily-view__hour-row"
          >
            <div className="scheduler__daily-view__hour-label">
              <p
                className={`scheduler__daily-view__hour-label__text${
                  isCurrentHour
                    ? " scheduler__daily-view__hour-label__text--current"
                    : ""
                }`}
              >
                {hour}
              </p>
            </div>
            <div className="scheduler__daily-view__slots-container">
              {slots.map((slotData, slotIndex) => {
                const { isAvailable, campaignData, enrolledCampaignsForSlot } =
                  mapSlotDataForDailyComponent(slotData, validCampaigns);

                return (
                  <DailyAvailabilitySlot
                    key={`slot-${hour}-${slotIndex}`}
                    classes={
                      slotData.consultation && hour === firstBookedHour
                        ? "scheduler__daily-slot--primary"
                        : ""
                    }
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
                    handleProposeConsultation={handleProposeConsultation}
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
  );
};
