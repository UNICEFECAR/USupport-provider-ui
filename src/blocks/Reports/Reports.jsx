import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  BaseTable,
  Block,
  Button,
  DropdownWithLabel,
  Modal,
  DateInput,
} from "@USupport-components-library/src";
import {
  getDateView,
  getTimeFromDate,
  ONE_HOUR,
  downloadCSVFile,
} from "@USupport-components-library/utils";

import { useGetProviderActivities } from "#hooks";

import "./reports.scss";

/**
 * Reports
 *
 * Reports block
 *
 * @return {jsx}
 */
export const Reports = () => {
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "reports" });
  const [dataToDisplay, setDataToDisplay] = useState();

  const rows = useMemo(() => {
    return [
      { label: t("client"), sortingKey: "displayName" },
      { label: t("time"), sortingKey: "time", isCentered: true, isDate: true },
      {
        label: t("price"),
        sortingKey: "price",
        isCentered: true,
        isNumbered: true,
      },
      { label: t("campaign"), sortingKey: "campaignName" },
    ];
  }, [i18n.language]);

  const currencySymbol = localStorage.getItem("currency_symbol");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { isLoading, data } = useGetProviderActivities();

  useEffect(() => {
    if (data) {
      setDataToDisplay(data);
    }
  }, [data]);

  const handleExport = () => {
    let csv = "";
    csv += rows.map((x) => x.label).join(",");

    dataToDisplay.forEach((row) => {
      const price = row.price ? `${row.price}${currencySymbol}` : t("free");
      csv += "\n";
      csv += `${row.displayName},`;
      csv += `${getFormattedDate(row.time, false)},`;
      csv += `${price},`;
      csv += `${row.campaignName || "N/A"}`;
    });

    const reportDate = new Date().toISOString().split("T")[0];
    const fileName = `report-${reportDate}.csv`;
    downloadCSVFile(csv, fileName);
  };

  const handleFilterOpen = () => {
    setIsFilterOpen(true);
  };

  const filterData = (activity, newFilters) => {
    const isCampaignMatching =
      !newFilters.campaign || newFilters.campaign === "all"
        ? true
        : activity.campaignName === newFilters.campaign;

    const isClientMatching = newFilters.client
      ? activity.displayName === newFilters.client
      : true;

    const createdAt = new Date(activity.time).getTime();
    const startDate = new Date(
      new Date(newFilters.startDate).setHours(0, 0, 0, 0)
    ).getTime();

    const isStartDateMatching = newFilters.startDate
      ? createdAt >= startDate
      : true;

    const isEndDateMatching = newFilters.endDate
      ? new Date(new Date(activity.time).setHours(0, 0, 0, 0)) <=
        new Date(newFilters.endDate)
      : true;

    return isStartDateMatching &&
      isEndDateMatching &&
      isClientMatching &&
      isCampaignMatching
      ? true
      : false;
  };

  const handleFilterSave = (newFilters) => {
    const filteredData = data.filter((x) => filterData(x, newFilters));
    setDataToDisplay(filteredData);
  };

  const getFormattedDate = (date, hasComma = true) => {
    const endTime = new Date(date.getTime() + ONE_HOUR);

    const displayTime = getTimeFromDate(date);
    const displayEndTime = getTimeFromDate(endTime);

    return `${displayTime} - ${displayEndTime}${
      hasComma ? "," : ""
    } ${getDateView(date)}`;
  };

  let campaignOptions = useMemo(() => {
    let res = Array.from(
      new Set(data?.filter((x) => x.campaignName).map((x) => x.campaignName))
    ).map((x) => ({ value: x, label: x }));
    res.unshift({ value: null, label: t("all") });
    return res;
  }, [data]);

  const clientOptions = useMemo(() => {
    return Array.from(new Set(data?.map((x) => x.displayName))).map((x) => ({
      value: x,
      label: x,
    }));
  }, [data]);

  const rowsData = dataToDisplay?.map((activity) => {
    const displayTime = getFormattedDate(activity.time);
    return [
      <p className="text ">{activity.displayName}</p>,
      <p className="text centered">{displayTime}</p>,
      <p className="text centered">
        {activity.price ? `${activity.price}${currencySymbol}` : t("free")}
      </p>,
      <p className="text">{activity.campaignName || "N/A"}</p>,
    ];
  });

  return (
    <Block classes="reports">
      <BaseTable
        rows={rows}
        rowsData={rowsData}
        data={dataToDisplay}
        updateData={setDataToDisplay}
        hasSearch
        hasMenu={false}
        buttonLabel={t("export_label")}
        buttonAction={handleExport}
        secondaryButtonLabel={t("filter")}
        secondaryButtonAction={handleFilterOpen}
        isLoading={isLoading}
        t={t}
      />

      <Filters
        isOpen={isFilterOpen}
        handleClose={() => setIsFilterOpen(false)}
        handleSave={handleFilterSave}
        campaignOptions={campaignOptions}
        clientOptions={clientOptions}
        t={t}
      />
    </Block>
  );
};

const Filters = ({
  isOpen,
  handleClose,
  handleSave,
  t,
  campaignOptions,
  clientOptions,
}) => {
  const initialData = {
    startDate: "",
    endDate: "",
    campaign: "",
    client: "",
  };
  const [data, setData] = useState({ ...initialData });

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    handleSave(data);
    handleClose();
  };

  const handleResetFilters = () => {
    setData({ ...initialData });
    handleSave({ ...initialData });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={handleClose}
      heading={t("filters")}
      classes="reports__filter-modal"
    >
      <>
        <div>
          {campaignOptions.length > 0 && (
            <DropdownWithLabel
              label={t("campaign")}
              selected={data.campaign}
              setSelected={(value) => handleChange("campaign", value)}
              options={campaignOptions}
            />
          )}

          <DropdownWithLabel
            label={t("client")}
            selected={data.client}
            setSelected={(value) => handleChange("client", value)}
            options={clientOptions}
          />
          <div className="reports__filter-modal__date-container">
            <DateInput
              label={t("start_date")}
              onChange={(e) => handleChange("startDate", e.currentTarget.value)}
              value={data.startDate}
              placeholder={t("dates_placeholder")}
              classes="reports__filter-modal__date-picker"
            />
            <DateInput
              label={t("end_date")}
              onChange={(e) => handleChange("endDate", e.currentTarget.value)}
              value={data.endDate}
              placeholder={t("dates_placeholder")}
              classes="reports__filter-modal__date-picker"
            />
          </div>
        </div>
        <div>
          <Button
            label={t("apply_filter")}
            size="lg"
            onClick={handleSubmit}
            classes="reports__filter-modal__submit-button"
          />
          <Button
            label={t("reset_filter")}
            type="secondary"
            size="lg"
            onClick={handleResetFilters}
            classes="reports__filter-modal__reset-button"
          />
        </div>
      </>
    </Modal>
  );
};
