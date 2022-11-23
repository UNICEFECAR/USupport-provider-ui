import React, { useState, useRef, useEffect } from "react";
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
} from "@USupport-components-library/src/utils/date";
import { useWindowDimensions } from "@USupport-components-library/utils";
import { useError } from "#hooks";
import { providerSvc } from "@USupport-components-library/services";

import "./scheduler.scss";

/**
 * Scheduler
 *
 * Scheduler block
 *
 * @return {jsx}
 */
export const Scheduler = () => {
  const { t } = useTranslation("scheduler");
  const navigate = useNavigate();
  const { width } = useWindowDimensions();

  const todayText = t("today");
  const today = new Date();
  const currentHourRef = useRef(null);
  // const blockRef = useRef(null);

  const { first: startDate, last: endDate } = getStartAndEndOfWeek(today);
  const [weekStartDate, setWeekStartDate] = useState(startDate);
  const [weekEndDate, setWeekEndDate] = useState(endDate);

  const days = getDatesInRange(new Date(startDate), new Date(endDate));
  const [weekDays, setWeekDays] = useState(days);

  const namesOfDays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const [slots, setSlots] = useState([]);

  // Get provider availability
  const fetchAvailableSlots = async () => {
    const response = await providerSvc.getAvailabilityForWeek(
      getTimestampFromUTC(weekStartDate)
    );
    return response.data;
  };
  const availableSlotsQuery = useQuery(
    ["available-slots", weekStartDate],
    fetchAvailableSlots,
    {
      onSuccess: (data) => {
        setSlots(data);
      },
    }
  );

  // Add available slot mutation
  const addAvailableSlot = async ({ startDate, timestampSlot }) => {
    await providerSvc.addAvailableSlot(startDate, timestampSlot);
    return timestampSlot;
  };
  const addAvailableSlotMutation = useMutation(addAvailableSlot, {
    onMutate: ({ timestampSlot }) => {
      const newSlot = new Date(timestampSlot * 1000).toISOString();
      setSlots([...slots, newSlot]);

      return () => {
        setSlots(slots.filter((slot) => slot !== newSlot));
      };
    },
    onSuccess: () => {
      availableSlotsQuery.refetch();
    },
    onError: (error, variables, rollback) => {
      rollback();
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
    },
  });

  // Remove available slot mutation
  const removeAvailableSlot = async ({ startDate, timestampSlot }) => {
    await providerSvc.removeAvailableSlot(startDate, timestampSlot);
    return timestampSlot;
  };
  const removeAvailableSlotMutation = useMutation(removeAvailableSlot, {
    onMutate: ({ timestampSlot }) => {
      const newSlot = new Date(timestampSlot * 1000).toISOString();
      setSlots(slots.filter((slot) => slot !== newSlot));

      return () => {
        setSlots([...slots, newSlot]);
      };
    },
    onSuccess: () => {
      availableSlotsQuery.refetch();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
    },
  });

  // When rendering every single slot check if
  // it exists in the provider's availability
  const checkIsAvailable = (day, hour) => {
    const date = getDateAsFullString(day, hour);
    const slot = slots.find((slot) => {
      const dateStr = new Date(slot).toString();
      return dateStr === date;
    });

    return !!slot;
  };

  const handleToggleAvailable = async (date, hour, newStatus) => {
    const timestampSlot = getTimestamp(date, hour);

    const timestampStartDate = getTimestampFromUTC(weekStartDate);
    const timestampEndDate = getTimestampFromUTC(weekEndDate, "23:59");

    const timestampPreviousWeekStartDate = getTimestampFromUTC(
      new Date(new Date(weekStartDate).setDate(weekStartDate.getDate() - 7))
    );
    const timestampPreviousWeekEndDate = getTimestampFromUTC(
      new Date(new Date(weekEndDate).setDate(weekStartDate.getDate() + 7))
    );

    let startDate = timestampStartDate;

    if (timestampSlot < timestampStartDate) {
      startDate = timestampPreviousWeekStartDate;
    }

    if (timestampSlot > timestampEndDate) {
      startDate = timestampPreviousWeekEndDate;
    }

    if (newStatus === "available") {
      addAvailableSlotMutation.mutate({ startDate, timestampSlot });
    } else {
      removeAvailableSlotMutation.mutate({ startDate, timestampSlot });
    }
  };

  const handleSetAvailable = (date, hour) => {
    handleToggleAvailable(date, hour, "available");
  };

  const handleSetUnavailable = (date, hour) => {
    handleToggleAvailable(date, hour, "unavailable");
  };

  const handleProposeConsultation = () => {
    console.log("propose consultation");
  };

  const handleCancelConsultation = () => {
    console.log("cancel consultation");
  };

  const handleViewProfile = () => {
    console.log("view profile");
  };

  const handleJoinConsultation = () => {
    console.log("join consultation");
  };

  const handleWeekChange = (direction) => {
    if (direction === "next") {
      const nextWeek = getStartAndEndOfWeek(
        new Date(weekEndDate.getTime() + 24 * 60 * 60 * 1000)
      );
      setWeekStartDate(nextWeek.first);
      setWeekEndDate(nextWeek.last);
      setWeekDays(getDatesInRange(nextWeek.first, nextWeek.last));
    } else {
      const prevWeek = getStartAndEndOfWeek(
        new Date(weekStartDate.getTime() - 24 * 60 * 60 * 1000)
      );
      setWeekStartDate(prevWeek.first);
      setWeekEndDate(prevWeek.last);
      setWeekDays(getDatesInRange(prevWeek.first, prevWeek.last));
    }
  };

  const handleEditClick = () => navigate("/calendar/template");

  return (
    <>
      <Block classes="scheduler__heading-block">
        <Heading
          handleWeekChange={handleWeekChange}
          handleEditClick={handleEditClick}
          startDate={weekStartDate}
          endDate={weekEndDate}
          width={width}
          t={t}
        />
        <div className="scheduler__days-grid__days-of-week-item">
          <Grid classes="scheduler__days-grid__days-of-week-item__grid">
            {weekDays.map((day, index) => {
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
        {availableSlotsQuery.isLoading ? (
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
                    {weekDays.map((day, dayIndex) => {
                      return (
                        <ProviderAvailability
                          key={"slot" + day.toString() + dayIndex.toString()}
                          isAvailable={checkIsAvailable(day, hour)}
                          handleSetUnavailable={() =>
                            handleSetUnavailable(day, hour)
                          }
                          handleSetAvailable={() =>
                            handleSetAvailable(day, hour)
                          }
                          handleProposeConsultation={handleProposeConsultation}
                          handleCancelConsultation={handleCancelConsultation}
                          handleViewProfile={handleViewProfile}
                          handleJoinConsultation={handleJoinConsultation}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
              {/* </Grid> */}
              {/* </GridItem> */}
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
