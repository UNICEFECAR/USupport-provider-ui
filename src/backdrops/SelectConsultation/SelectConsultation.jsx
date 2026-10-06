import React, { useState, useEffect } from "react";
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
import {
  getTimestampFromUTC,
  getTimeRangeAsString,
} from "@USupport-components-library/utils";

import { useGetProviderData } from "#hooks";

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
  const { t } = useTranslation("modals", { keyPrefix: "select-consultation" });

  const providerData = useGetProviderData()[0].data;

  const [startDate, setStartDate] = useState(null);
  const [currentDay, setCurrentDay] = useState(new Date().getTime());

  useEffect(() => {
    if (providerData) {
      const earliestAvailableSlot = providerData?.earliestAvailableSlot;
      if (earliestAvailableSlot) {
        setCurrentDay(new Date(earliestAvailableSlot).getTime());
      }
    }
  }, [providerData]);

  const [selectedSlot, setSelectedSlot] = useState("");

  const getAvailableSlots = async (startDate, currentDay) => {
    const { data } = await providerSvc.getAvailableSlotsForSingleDay(
      getTimestampFromUTC(startDate),
      getTimestampFromUTC(currentDay)
    );

    // The API returns { time, duration_minutes, campaign_id, organization_id }
    // for every slot, with `time` as epoch milliseconds, and has already dropped
    // slots that overlap one another - that de-duplication used to live here.
    return data.map((x) => ({
      time: new Date(x.time),
      duration_minutes: x.duration_minutes,
      organization_id: x.organization_id,
    }));
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
      const slotDate = new Date(slot.time || slot).getDate();
      const currentDayDate = new Date(currentDay).getDate();
      return slotDate === currentDayDate;
    });
    if (!todaySlots || todaySlots?.length === 0)
      return <p>{t("no_slots_available")}</p>;
    const options = todaySlots?.map(
      (slot) => {
        const slotLocal = new Date(slot.time || slot);

        const value = new Date(slot.time || slot).getTime();

        // "16:00 - 16:30" for a half-hour slot, "16:00 - 17:00" for an hour.
        const label = getTimeRangeAsString(slotLocal, slot.duration_minutes);

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
    const allMatchingSlots = availableSlots.filter((slot) => {
      const isTimeMatching = new Date(slot.time).getTime() === selectedSlot;
      return isTimeMatching;
    });

    let slotObject;
    if (allMatchingSlots.length >= 1) {
      const hasOrganizationSlot = allMatchingSlots.find(
        (slot) => !!slot.organization_id
      );
      if (hasOrganizationSlot) {
        slotObject = hasOrganizationSlot;
      }
    }

    const time = slotObject || selectedSlot;

    handleBlockSlot(time);
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
        <Header
          handleDayChange={handleDayChange}
          setStartDate={setStartDate}
          startDate={providerData?.earliestAvailableSlot}
          t={t}
        />
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
