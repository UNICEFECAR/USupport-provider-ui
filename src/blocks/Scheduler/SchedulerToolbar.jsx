import React, { useContext } from "react";
import {
  Grid,
  GridItem,
  Icon,
  NewButton,
  Tabs,
} from "@USupport-components-library/src";
import { ThemeContext } from "@USupport-components-library/utils";

import { SchedulerDatePicker } from "./SchedulerDatePicker.jsx";

/**
 * Tabs + centered date navigation + primary action (matches Dashboard V1 scheduler header).
 */
export const SchedulerToolbar = ({
  periodTypes,
  onPeriodChange,
  dateLabel,
  selectedPeriod,
  selectedDate,
  monthViewDate,
  weekDays,
  onDateSelect,
  onMonthSelect,
  onPrev,
  onNext,
  onAddAvailabilityTemplate,
  width,
  addAvailabilityTemplateLabel,
  t,
  language,
}) => {
  const { theme } = useContext(ThemeContext);
  const iconColor =
    theme === "highContrast"
      ? "#ffff00"
      : theme === "dark"
        ? "#c1d7e0"
        : "#6989A4";

  const handleSelectTab = (index) => {
    const newOptions = periodTypes.map((option, i) => ({
      ...option,
      isSelected: i === index,
    }));
    onPeriodChange(newOptions);
  };

  const iconSize = width < 768 ? "lg" : "md";

  return (
    <div className="scheduler-toolbar">
      <Grid classes="scheduler-toolbar__grid">
        <GridItem
          xs={4}
          md={8}
          lg={8}
          classes="scheduler-toolbar__cell scheduler-toolbar__cell--leading"
        >
          <div className="scheduler-toolbar__leading">
            <Tabs options={periodTypes} handleSelect={handleSelectTab} />
            <div className="scheduler-toolbar__date-nav">
              <Icon
                color={iconColor}
                name="arrow-chevron-back"
                size={iconSize}
                onClick={onPrev}
              />
              <SchedulerDatePicker
                dateLabel={dateLabel}
                selectedPeriod={selectedPeriod}
                selectedDate={selectedDate}
                monthViewDate={monthViewDate}
                weekDays={weekDays}
                onDateSelect={onDateSelect}
                onMonthSelect={onMonthSelect}
                t={t}
                language={language}
              />
              <Icon
                color={iconColor}
                name="arrow-chevron-forward"
                size={iconSize}
                onClick={onNext}
              />
            </div>
          </div>
        </GridItem>
        <GridItem
          xs={4}
          md={8}
          lg={4}
          classes="scheduler-toolbar__cell scheduler-toolbar__cell--action"
        >
          <NewButton
            type="gradient"
            size="md"
            iconName="actions-plus"
            label={addAvailabilityTemplateLabel}
            onClick={onAddAvailabilityTemplate}
            classes="scheduler-toolbar__add-btn"
          />
        </GridItem>
      </Grid>
    </div>
  );
};
