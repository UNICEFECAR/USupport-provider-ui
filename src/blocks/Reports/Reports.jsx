import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Button,
  Loading,
  DropdownWithLabel,
  Input,
  Modal,
} from "@USupport-components-library/src";
import {
  getDateView,
  getTimeFromDate,
  ONE_HOUR,
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
  const { t } = useTranslation("reports");
  const rows = ["client", "time", "price", "campaign"];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const { isLoading, data } = useGetProviderActivities();

  const handleExport = () => {};
  const handleFilterOpen = () => {
    setIsFilterOpen(true);
  };

  const handleFilterSave = (data) => {
    setFilters(data);
  };

  const filterData = (activity) => {
    // TODO: Add filter for campaigns

    const isClientMatching = filters.client
      ? activity.displayName === filters.client
      : true;

    const isStartDateMatching = filters.startDate
      ? new Date(activity.time).getTime() >=
        new Date(filters.startDate).getTime()
      : true;

    const isEndDateMatching = filters.endDate
      ? new Date(activity.time).getTime() <= new Date(filters.endDate).getTime()
      : true;

    return isStartDateMatching && isEndDateMatching && isClientMatching
      ? true
      : false;
  };

  const renderData = useMemo(() => {
    const filteredData = data?.filter(filterData);

    if (!filteredData || filteredData?.length === 0)
      return (
        <tr>
          <td
            className="reports__table__td__no-results"
            align="center"
            colSpan={4}
          >
            <h4>{t("no_results")}</h4>
          </td>
        </tr>
      );

    return filteredData?.map((activity, index) => {
      const endTime = new Date(activity.time.getTime() + ONE_HOUR);

      const displayTime = getTimeFromDate(activity.time);
      const displayEndTime = getTimeFromDate(endTime);

      return (
        <tr key={index}>
          <td className="reports__table__td">
            <p className="text reports__table__name">{activity.displayName}</p>
          </td>
          <td className="reports__table__td">
            <p className="text reports__table__name">
              {displayTime} - {displayEndTime}, {getDateView(activity.time)}
            </p>
          </td>
          <td className="reports__table__td">
            <p className="text">{activity.price || t("free")}</p>
          </td>
          <td className="reports__table__td">
            <p className="text">{activity.campaign || "N/A"}</p>
          </td>
        </tr>
      );
    });
  }, [data, filters]);

  let campaignOptions =
    data
      ?.map((x) => {
        if (x.campaign) {
          return { value: x.campaign, label: x.campaign };
        }
        return null;
      })
      .filter((x) => x !== null) || [];

  const clientOptions =
    data?.map((x) => ({ value: x.displayName, label: x.displayName })) || [];

  return (
    <Block classes="reports">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="reports__buttons">
            <Button
              type="secondary"
              color="purple"
              label={t("export_label")}
              onClick={handleExport}
              size="md"
            />
            <Button
              type="primary"
              color="purple"
              label={t("filter")}
              onClick={handleFilterOpen}
              size="md"
            />
          </div>
          <div className="reports__container">
            <table className="reports__table">
              <thead>
                <tr>
                  {rows.map((row, index) => {
                    return <th key={row + index}>{t(row)}</th>;
                  })}
                </tr>
              </thead>
              <tbody>{renderData}</tbody>
            </table>
          </div>
        </>
      )}
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
  const [data, setData] = useState({
    startDate: "",
    endDate: "",
  });

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
            <Input
              type="date"
              label={t("start_date")}
              onChange={(e) => handleChange("startDate", e.currentTarget.value)}
              value={data.startDate}
              placeholder="DD.MM.YYY"
              classes="reports__filter-modal__date-picker"
            />
            <Input
              type="date"
              label={t("end_date")}
              onChange={(e) => handleChange("endDate", e.currentTarget.value)}
              value={data.endDate}
              placeholder="DD.MM.YYY"
              classes="reports__filter-modal__date-picker"
            />
          </div>
        </div>
        <div>
          <Button label={t("submit")} size="lg" onClick={handleSubmit} />
        </div>
      </>
    </Modal>
  );
};
