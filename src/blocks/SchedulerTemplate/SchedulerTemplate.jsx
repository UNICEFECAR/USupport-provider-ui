import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useCustomNavigate as useNavigate } from "#hooks";
import { toast } from "react-toastify";
import {
  Block,
  Box,
  Dropdown,
  DropdownWithLabel,
  NewButton,
  CheckBox,
  Select,
} from "@USupport-components-library/src";
import {
  getDateView,
  getStartAndEndOfWeek,
  getXDaysInSeconds,
  getTimestamp,
  getTimestampFromUTC,
  hours,
} from "@USupport-components-library/utils";
import { providerSvc } from "@USupport-components-library/services";

import { useGetProviderData, useError, useGetCampaigns } from "#hooks";

import "./scheduler-template.scss";

/**
 * SchedulerTemplate
 *
 * Edit scheduler template availability
 *
 * @return {jsx}
 */
export const SchedulerTemplate = ({ campaignId }) => {
  const { t } = useTranslation("blocks", { keyPrefix: "scheduler-template" });
  const hasNormalSlots = localStorage.getItem("has_normal_slots") === "true";
  const IS_KZ_COUNTRY = localStorage.getItem("country") === "KZ";

  const navigate = useNavigate();
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const providerQuery = useGetProviderData()[0];
  const providerStatus = providerQuery?.data?.status;
  const organizations = providerQuery?.data?.organizations || [];

  const campaignsQuery = useGetCampaigns();
  const providerCampaigns = campaignsQuery?.data?.providerCampaigns || [];

  const initialTemplate = {};
  daysOfWeek.forEach(
    (day) =>
      (initialTemplate[day] = { unavailable: false, start: "", end: "" }),
  );

  const today = new Date();

  const { first, last } = getStartAndEndOfWeek(today);
  const allMondays = [];
  const allMondaysUTC = [];
  const allSundays = [];
  for (let i = 0; i < 104; i++) {
    const monday = new Date(first);
    monday.setDate(monday.getDate() + i * 7);
    allMondays.push(getTimestamp(monday));
    allMondaysUTC.push(getTimestampFromUTC(monday));

    const sunday = new Date(last);
    sunday.setDate(sunday.getDate() + i * 7);
    allSundays.push(getTimestamp(sunday));
  }

  const [template, setTemplate] = useState(initialTemplate);
  const [templateStartDate, setTemplateStartDate] = useState("");
  const [templateEndDate, setTemplateEndDate] = useState("");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState(
    campaignId ? [campaignId] : [],
  );
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [showSelectionError, setShowSelectionError] = useState(false);
  const hoursOptions = hours.map((hour) => ({ label: hour, value: hour }));

  const campaignSelectOptions = useMemo(() => {
    return providerCampaigns.map((c) => ({
      label: `${c.sponsorName} / ${c.campaignName}`,
      value: c.campaignId,
      selected: selectedCampaignIds.includes(c.campaignId),
    }));
  }, [providerCampaigns, selectedCampaignIds]);

  const organizationDropdownOptions = useMemo(() => {
    const noneLabel = t("organization_none", {
      defaultValue: t("organization_placeholder"),
    });

    const baseOptions = organizations.map((o) => ({
      label: o.name,
      value: o.organizationId,
    }));

    // Add a "none" option on top so the user can clear the selection.
    // This sets the selected organization ID to an empty string.
    return [
      {
        label: noneLabel,
        value: "",
      },
      ...baseOptions,
    ];
  }, [organizations, t]);

  const hasSelection =
    selectedCampaignIds.length > 0 || !!selectedOrganizationId;

  // Check if the template contains any actual time ranges (start/end) that
  // would create availability slots. If there are no such ranges and the user
  // only marks days as "unavailable", we allow submission even without
  // selecting organization / campaign.
  const hasTimeRangesSelected = useMemo(
    () =>
      Object.values(template).some(
        ({ unavailable, start, end }) => !unavailable && start && end,
      ),
    [template],
  );

  // Selection (campaign / organization) is only required in countries that do
  // NOT support normal slots, and only when the user is actually adding new
  // availability time ranges.
  const isSelectionRequired = !hasNormalSlots && hasTimeRangesSelected;

  // The save button should only be enabled when the user has either:
  // - selected at least one time range (start & end), or
  // - marked at least one day as "unavailable".
  const hasAnyDayConfigured = useMemo(
    () =>
      Object.values(template).some(
        ({ unavailable, start, end }) => unavailable || (start && end),
      ),
    [template],
  );

  const handleChangeIsAvailable = (day) => {
    const newTemplate = { ...template };
    newTemplate[day].unavailable = !newTemplate[day].unavailable;
    setTemplate(newTemplate);
  };

  const handleHourChange = (value, day, field) => {
    const templateCopy = { ...template };
    templateCopy[day][field] = value;
    setTemplate(templateCopy);
  };

  const getWeekDaysOptions = (options) => {
    return options.map((x) => {
      return { label: getDateView(new Date(x * 1000)), value: x };
    });
  };

  const getMondayOptions = useMemo(() => {
    return getWeekDaysOptions(allMondays)
      .filter((x) => x !== templateEndDate)
      .filter((x) => {
        if (!templateEndDate) return true;
        return x.value < templateEndDate;
      }); // Show only mondays before the end date
  }, [templateEndDate]);

  const getSundayOptions = useMemo(() => {
    return getWeekDaysOptions(allSundays)
      .filter((x) => x.value !== templateStartDate)
      .filter((x) => x.value > (templateStartDate || 0)); // Show only sundays later than start date
  }, [templateStartDate]);

  const getEndHoursOptions = (startHour) => {
    const startHourIndex = hoursOptions.findIndex((x) => x.value === startHour);
    return hoursOptions.slice(startHourIndex + 1);
  };

  const addTemplateAvailability = async (timestamps) => {
    const payload = { template: timestamps };

    // Always send arrays
    const finalCampaignIds =
      selectedCampaignIds?.length > 0
        ? selectedCampaignIds
        : campaignId
          ? [campaignId]
          : [];
    const finalOrganizationIds = selectedOrganizationId
      ? [selectedOrganizationId]
      : [];

    if (finalCampaignIds.length > 0) payload.campaignIds = finalCampaignIds;
    if (finalOrganizationIds.length > 0)
      payload.organizationIds = finalOrganizationIds;

    const res = await providerSvc.addTemplateAvailability(payload);
    return res;
  };
  const addTemplateAvailabilityMutation = useMutation(addTemplateAvailability, {
    onSuccess: () => {
      toast("Template availability added successfully");
      navigate("/calendar");
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
    },
  });

  const handleSubmit = async () => {
    if (providerStatus !== "active") {
      return;
    }
    if (isSelectionRequired && !hasSelection) {
      setShowSelectionError(true);
      toast(
        t("selection_required", {
          defaultValue: "Select at least one campaign or organization",
        }),
        { type: "error" },
      );
      return;
    }
    const start = templateStartDate;
    // Gett all mondays between start and end
    const lastMonday = templateEndDate - getXDaysInSeconds(6);
    let mondays = allMondays.filter((x) => x >= start && x <= lastMonday);
    /**
     * 1. Loop through all the monday timestamps
     * 2. For each monday timestamp, calculate a timestamp for each day of that week and loop through each day
     * 3. For each day, check if it is unavailable
     * 4. If it is unavailable, skip it
     * 5. If it is available, check if the start and end times are set
     * 6. If they are not set, skip it
     * 7. If they are set, loop through all the hours between the start and end times
     * 8. For each hour, add the timestamp of the day and the hour to the array of timestamps for the current monday
     * 9. After looping through all the days in the week, add the array of timestamps for the current monday to the array of all timestamps for the template
     * 10. After looping through all the mondays, send the array of all timestamps to the backend
     */

    const timestamps = [];
    const removalJobs = [];
    mondays.forEach((monday) => {
      const currentTimeZoneOffset =
        new Date(monday * 1000).getTimezoneOffset() * 60;

      const startDate =
        getTimestamp(new Date(monday * 1000)) - currentTimeZoneOffset;

      const endDate =
        getTimestamp(
          new Date((monday + getXDaysInSeconds(6)) * 1000),
          "23:59:59",
        ) - currentTimeZoneOffset;

      const mondayTimestamps = {
        startDate: JSON.stringify(startDate),
        slots: [],
      };

      for (let i = 0; i < 7; i++) {
        const day = monday + getXDaysInSeconds(i);
        const isUnavailable = template[daysOfWeek[i]].unavailable;
        const { start, end } = template[daysOfWeek[i]];
        // If the day is marked as unavailable, schedule removal for all hourly slots of that day
        if (isUnavailable) {
          const finalCampaignIds =
            selectedCampaignIds?.length > 0
              ? selectedCampaignIds
              : campaignId
                ? [campaignId]
                : [];
          const finalOrganizationId = selectedOrganizationId || null;
          // Use the shared hours list to generate per-hour timestamps for the day
          for (let j = 0; j < hours.length; j++) {
            const hour = parseInt(hours[j].split(":")[0]);
            const currentTimestamp = day + hour * 60 * 60;
            let targetMondayStart = startDate;
            if (currentTimestamp < startDate) {
              targetMondayStart = startDate - getXDaysInSeconds(7);
            } else if (currentTimestamp > endDate) {
              targetMondayStart = startDate + getXDaysInSeconds(7);
            }
            removalJobs.push(
              providerSvc.removeMultipleAvailableSlots(
                targetMondayStart,
                currentTimestamp,
                finalCampaignIds,
                finalOrganizationId,
              ),
            );
          }
          continue;
        }
        // Else, add template availability for selected time window
        if (!start || !end) continue;
        const startHour = parseInt(start.split(":")[0]);
        const endHour = parseInt(end.split(":")[0]);
        for (let j = startHour; j < endHour; j++) {
          const currentTimestamp = day + j * 60 * 60;
          const currentTimestampStr = JSON.stringify(currentTimestamp);

          if (currentTimestamp < startDate) {
            const previousMonday = startDate - getXDaysInSeconds(7);
            const index = timestamps.indexOf(
              timestamps.find(
                (timestamp) =>
                  timestamp.startDate === JSON.stringify(previousMonday),
              ),
            );
            if (index === -1) {
              const newTimestampObject = {
                startDate: JSON.stringify(previousMonday),
                slots: [currentTimestampStr],
              };
              timestamps.push(newTimestampObject);
            } else {
              timestamps[index].slots.push(currentTimestampStr);
            }
            continue;
          }
          if (currentTimestamp > endDate) {
            const nextMonday = startDate + getXDaysInSeconds(7);
            const index = timestamps.indexOf(
              timestamps.find(
                (timestamp) =>
                  timestamp.startDate === JSON.stringify(nextMonday),
              ),
            );
            if (index === -1) {
              const newTimestampObject = {
                startDate: JSON.stringify(nextMonday),
                slots: [currentTimestampStr],
              };
              timestamps.push(newTimestampObject);
            } else {
              timestamps[index].slots.push(currentTimestampStr);
            }
            continue;
          }

          mondayTimestamps.slots.push(currentTimestampStr);
        }
      }

      const startDateIndex = timestamps.indexOf(
        timestamps.find(
          (timestamp) => timestamp.startDate === mondayTimestamps.startDate,
        ),
      );
      if (startDateIndex === -1) {
        timestamps.push(mondayTimestamps);
      } else {
        timestamps[startDateIndex].slots.push(mondayTimestamps.slots);
      }
    });

    try {
      if (removalJobs.length > 0) {
        await Promise.all(removalJobs);
      }
    } catch (error) {
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
      return;
    }

    if (timestamps.length > 0) {
      addTemplateAvailabilityMutation.mutate(timestamps);
    } else {
      toast(t("successfully_saved", { defaultValue: "Changes saved" }));
      navigate("/calendar");
    }
  };

  return (
    <Block classes="scheduler-template">
      <div className="scheduler-template__content">
        <Box classes="scheduler-template__section" boxShadow={3}>
          <h3 className="scheduler-template__section-title">
            {t("section_assignment", {
              defaultValue: "Campaign and organization",
            })}
          </h3>
          <div className="scheduler-template__section-grid">
            {!IS_KZ_COUNTRY && campaignSelectOptions.length > 0 ? (
              <Select
                options={campaignSelectOptions}
                handleChange={(opts) => {
                  const values = opts
                    .filter((o) => o.selected)
                    .map((o) => o.value);
                  setSelectedCampaignIds(values);
                  if (values.length > 0 || !!selectedOrganizationId) {
                    setShowSelectionError(false);
                  }
                }}
                label={t("campaign")}
                placeholder={t("campaign_placeholder")}
                classes="scheduler-template__field"
                isDisabled={providerStatus !== "active"}
                errorMessage={
                  showSelectionError && isSelectionRequired && !hasSelection
                    ? t("selection_required", {
                        defaultValue:
                          "Select at least one campaign or organization",
                      })
                    : null
                }
              />
            ) : null}
            <DropdownWithLabel
              options={organizationDropdownOptions}
              selected={selectedOrganizationId}
              setSelected={(value) => {
                setSelectedOrganizationId(value);
                if (value || selectedCampaignIds.length > 0) {
                  setShowSelectionError(false);
                }
              }}
              label={t("organization")}
              disabled={providerStatus !== "active"}
              classes="scheduler-template__field"
            />
          </div>
        </Box>

        <Box classes="scheduler-template__section" boxShadow={3}>
          <h3 className="scheduler-template__section-title">
            {t("section_date_range", {
              defaultValue: "Date range",
            })}
          </h3>
          <div className="scheduler-template__section-grid scheduler-template__section-grid--dates">
            <DropdownWithLabel
              options={getMondayOptions}
              selected={templateStartDate}
              setSelected={(value) => {
                setTemplateStartDate(value);
              }}
              label={t("start_date")}
              disabled={providerStatus !== "active"}
              classes="scheduler-template__field"
            />
            <DropdownWithLabel
              options={getSundayOptions}
              selected={templateEndDate}
              setSelected={(value) => setTemplateEndDate(value)}
              label={t("end_date")}
              disabled={providerStatus !== "active"}
              classes="scheduler-template__field"
            />
          </div>
        </Box>

        <Box classes="scheduler-template__section" boxShadow={3}>
          <h3 className="scheduler-template__section-title">
            {t("section_weekly_hours", {
              defaultValue: "Weekly schedule",
            })}
          </h3>
          <div className="scheduler-template__days-grid">
            {daysOfWeek.map((day, index) => (
              <div
                key={day}
                className={[
                  "scheduler-template__day",
                  index === 6 ? "scheduler-template__day--full-width" : "",
                ].join(" ")}
              >
                <h4 className="scheduler-template__day-heading">{t(day)}</h4>
                <CheckBox
                  isChecked={template[day].unavailable}
                  setIsChecked={() => handleChangeIsAvailable(day)}
                  label={t("unavailable")}
                  classes="scheduler-template__day__checkbox"
                />
                <div
                  className={[
                    "scheduler-template__day-times",
                    template[day].unavailable
                      ? "scheduler-template__day-times--disabled"
                      : "",
                  ].join(" ")}
                >
                  <div className="scheduler-template__day-times__field">
                    <p className="text scheduler-template__day-times__label">
                      {t("from")}
                    </p>
                    <Dropdown
                      disabled={
                        template[day].unavailable || providerStatus !== "active"
                      }
                      options={hoursOptions}
                      selected={template[day].start || ""}
                      setSelected={(value) =>
                        handleHourChange(value, day, "start")
                      }
                    />
                  </div>
                  <span
                    className="scheduler-template__day-times__divider"
                    aria-hidden="true"
                  >
                    –
                  </span>
                  <div className="scheduler-template__day-times__field">
                    <p className="text scheduler-template__day-times__label">
                      {t("to")}
                    </p>
                    <Dropdown
                      disabled={
                        template[day].unavailable || providerStatus !== "active"
                      }
                      options={getEndHoursOptions(template[day].start)}
                      selected={template[day].end || ""}
                      setSelected={(value) =>
                        handleHourChange(value, day, "end")
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Box>

        <div className="scheduler-template__buttons">
          <NewButton
            onClick={handleSubmit}
            type="gradient"
            label={t("save")}
            size="lg"
            classes="scheduler-template__save-button"
            disabled={
              !templateStartDate ||
              !templateEndDate ||
              (isSelectionRequired && !hasSelection) ||
              !hasAnyDayConfigured
            }
            loading={addTemplateAvailabilityMutation.isLoading}
          />
        </div>
      </div>
    </Block>
  );
};
