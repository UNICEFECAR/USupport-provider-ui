import React, { useState } from "react";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Backdrop,
  Header,
  RadioButtonSelectorGroup,
  Loading,
} from "@USupport-components-library/src";
import { providerSvc } from "@USupport-components-library/services";
import { getTimestampFromUTC } from "@USupport-components-library/utils";
import "./select-consultation.scss";

/**
 * SelectConsultation
 *
 * The SelectConsultation backdrop
 *
 * @return {jsx}
 */
export const SelectConsultation = ({
  isOpen,
  onClose,
  edit = false,
  handleBlockSlot,
  providerId,
  isCtaDisabled = false,
  errorMessage,
}) => {
  const { t } = useTranslation("select-consultation");

  const [startDate, setStartDate] = useState(null);
  const [currentDay, setCurrentDay] = useState(new Date().getTime());
  const [selectedSlot, setSelectedSlot] = useState("");

  const getAvailableSlots = async (startDate, currentDay) => {
    const { data } = await providerSvc.getAvailableSlotsForSingleDay(
      getTimestampFromUTC(startDate),
      getTimestampFromUTC(currentDay)
    );
    return data;
  };
  const availableSlotsQuery = useQuery(
    ["available-slots", startDate, currentDay, providerId],
    () => getAvailableSlots(startDate, currentDay, providerId),
    { enabled: !!startDate && !!currentDay && !!providerId }
  );
  const availableSlots = availableSlotsQuery.data;
  const handleDayChange = (start, day) => {
    setStartDate(start);
    setCurrentDay(day);
  };

  const handleChooseSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const renderFreeSlots = () => {
    const todaySlots = availableSlots?.filter((slot) => {
      const slotDate = new Date(slot).getDate();
      const currentDayDate = new Date(currentDay).getDate();
      return slotDate === currentDayDate;
    });
    if (!todaySlots || todaySlots?.length === 0)
      return <p>{t("no_slots_available")}</p>;
    const options = todaySlots?.map(
      (slot) => {
        const slotLocal = new Date(slot);
        const value = new Date(slot).getTime();
        const getDoubleDigitHour = (hour) =>
          hour === 24 ? "00" : hour < 10 ? `0${hour}` : hour;

        const displayStartHours = getDoubleDigitHour(slotLocal.getHours());
        const displayStartMinutes = getDoubleDigitHour(slotLocal.getMinutes());
        const displayEndHours = getDoubleDigitHour(slotLocal.getHours() + 1);
        const displayEndMinutes = getDoubleDigitHour(slotLocal.getMinutes());
        const label = `${displayStartHours}:${displayStartMinutes} - ${displayEndHours}:${displayEndMinutes}`;

        return { label: label, value };
      },
      [availableSlots]
    );

    return (
      <RadioButtonSelectorGroup
        options={options}
        name="free-slots"
        selected={selectedSlot}
        setSelected={handleChooseSlot}
        classes="select-consultation__radio-button-selector-group"
      />
    );
  };

  const handleSave = () => {
    handleBlockSlot(selectedSlot);
  };

  return (
    <Backdrop
      classes="select-consultation"
      title="SelectConsultation"
      isOpen={isOpen}
      onClose={onClose}
      heading={edit === true ? t("heading_edit") : t("heading_new")}
      text={edit === true ? t("subheading_edit") : t("subheading_new")}
      ctaLabel={t("cta_button_label")}
      ctaHandleClick={handleSave}
      isCtaDisabled={isCtaDisabled ? true : !selectedSlot ? true : false}
      errorMessage={errorMessage}
    >
      <div className="select-consultation__content-container">
        <Header handleDayChange={handleDayChange} setStartDate={setStartDate} />
        <div className="select-consultation__content-container__slots">
          {availableSlotsQuery.isLoading ? (
            <Loading size="md" />
          ) : (
            renderFreeSlots()
          )}
        </div>
      </div>
    </Backdrop>
  );
};

SelectConsultation.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  edit: PropTypes.bool,
  handleConfirmConsultation: PropTypes.func,
  providerId: PropTypes.string,
  isCtaDisabled: PropTypes.bool,
};
