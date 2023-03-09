import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Block,
  Grid,
  GridItem,
  Dropdown,
  DropdownWithLabel,
  Button,
  CheckBox,
} from "@USupport-components-library/src";
import {
  getDateView,
  getStartAndEndOfWeek,
  getXDaysInSeconds,
  getTimestamp,
  getTimestampFromUTC,
  hours,
  useWindowDimensions,
} from "@USupport-components-library/utils";
import { providerSvc } from "@USupport-components-library/services";

import "./scheduler-template.scss";

/**
 * SchedulerTemplate
 *
 * Edit scheduler template availability
 *
 * @return {jsx}
 */
export const SchedulerTemplate = ({ campaignId }) => {
  const { t } = useTranslation("scheduler-template");
  const navigate = useNavigate();
  const { width } = useWindowDimensions();
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const initialTemplate = {};
  daysOfWeek.forEach(
    (day) => (initialTemplate[day] = { unavailable: false, start: "", end: "" })
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [template, setTemplate] = useState(initialTemplate);
  const [templateStartDate, setTemplateStartDate] = useState("");
  const [templateEndDate, setTemplateEndDate] = useState("");
  const hoursOptions = hours.map((hour) => ({ label: hour, value: hour }));

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
    const res = await providerSvc.addTemplateAvailability({
      template: timestamps,
      campaignId,
    });
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
    setIsSubmitting(true);
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
    mondays.forEach((monday) => {
      const currentTimeZoneOffset = new Date().getTimezoneOffset() * 60;

      const startDate =
        getTimestamp(new Date(monday * 1000)) - currentTimeZoneOffset;

      const endDate =
        getTimestamp(
          new Date((monday + getXDaysInSeconds(6)) * 1000),
          "23:59:59"
        ) - currentTimeZoneOffset;

      const mondayTimestamps = {
        startDate: JSON.stringify(startDate),
        slots: [],
      };

      for (let i = 0; i < 7; i++) {
        const day = monday + getXDaysInSeconds(i);
        if (template[daysOfWeek[i]].unavailable) {
          continue;
        }
        const { start, end } = template[daysOfWeek[i]];
        if (!start || !end) {
          continue;
        }
        const startHour = parseInt(start.split(":")[0]);
        const endHour = parseInt(end.split(":")[0]);
        for (let j = startHour; j <= endHour; j++) {
          const currentTimestamp = day + j * 60 * 60;
          const currentTimestampStr = JSON.stringify(currentTimestamp);

          if (currentTimestamp < startDate) {
            const previousMonday = startDate - getXDaysInSeconds(7);
            const index = timestamps.indexOf(
              timestamps.find(
                (timestamp) =>
                  timestamp.startDate === JSON.stringify(previousMonday)
              )
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
                  timestamp.startDate === JSON.stringify(nextMonday)
              )
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
          (timestamp) => timestamp.startDate === mondayTimestamps.startDate
        )
      );
      if (startDateIndex === -1) {
        timestamps.push(mondayTimestamps);
      } else {
        timestamps[startDateIndex].slots.push(mondayTimestamps.slots);
      }
    });

    // Change all the slots from timestamp to new date
    // const slots = timestamps.map((x) => ({
    //   startDate: new Date(parseInt(x.startDate) * 1000),
    //   slots: x.slots.map((y) => new Date(y * 1000)),
    // }));

    addTemplateAvailabilityMutation.mutate(timestamps);
  };

  return (
    <Block classes="scheduler-template">
      <Grid classes="scheduler-template__grid">
        <GridItem
          md={8}
          lg={12}
          classes="scheduler-template__grid__week-selector"
        >
          <DropdownWithLabel
            options={getMondayOptions}
            selected={templateStartDate}
            setSelected={(value) => {
              setTemplateStartDate(value);
            }}
            label={t("start_date")}
          />
          <DropdownWithLabel
            options={getSundayOptions}
            selected={templateEndDate}
            setSelected={(value) => setTemplateEndDate(value)}
            label={t("end_date")}
          />
        </GridItem>
        {daysOfWeek.map((day, index) => {
          return (
            <GridItem
              md={width < 900 ? 8 : 4}
              lg={index === 6 ? 12 : 6}
              classes={
                index % 2 === 0 &&
                index !== 6 &&
                "scheduler-template__grid__item"
              }
            >
              <div key={day + index} className="scheduler-template__grid__day">
                <h4 className="scheduler-template__grid__day-heading">
                  {t(day)}
                </h4>
                <CheckBox
                  isChecked={template[day].unavailable}
                  setIsChecked={() => handleChangeIsAvailable(day)}
                  label={t("unavailable")}
                  classes="scheduler-template__grid__day__checkbox"
                />
                <div className="scheduler-template__grid__day-time-selector">
                  <div className="scheduler-template__grid__day-time-selector__single">
                    <p>From</p>
                    <Dropdown
                      disabled={template[day].unavailable}
                      options={hoursOptions}
                      selected={template[day].start || ""}
                      setSelected={(value) =>
                        handleHourChange(value, day, "start")
                      }
                    />
                  </div>
                  <div className="scheduler-template__grid__day-time-selector__single">
                    <p>to</p>
                    <Dropdown
                      disabled={template[day].unavailable}
                      options={getEndHoursOptions(template[day].start)}
                      selected={template[day].end || ""}
                      setSelected={(value) =>
                        handleHourChange(value, day, "end")
                      }
                    />
                  </div>
                </div>
              </div>
            </GridItem>
          );
        })}
        <GridItem md={8} lg={12}>
          <Button
            onClick={handleSubmit}
            type="primary"
            label={t("save")}
            size="lg"
            classes="scheduler-template__grid__save-button"
            disabled={!templateStartDate || !templateEndDate}
            loading={addTemplateAvailabilityMutation.isLoading}
          />
        </GridItem>
      </Grid>
    </Block>
  );
};
