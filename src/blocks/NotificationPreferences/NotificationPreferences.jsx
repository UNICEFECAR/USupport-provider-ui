import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import {
  Block,
  Grid,
  GridItem,
  RadioButton,
  CheckBoxSelectorGroup,
  Loading,
  Error as ErrorComponent,
} from "@USupport-components-library/src";
import {
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
  useError,
  useGetProviderData,
} from "#hooks";

import { mascotCalmBlue } from "@USupport-components-library/assets";

import "./notification-preferences.scss";

/**
 * NotificationPreferences
 *
 * Notification preferences block
 *
 * @return {jsx}
 */
export const NotificationPreferences = () => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "notification-preferences",
  });

  const [minutes, setMinutes] = useState([
    { value: 15, label: "15 " + t("minutes_before"), isSelected: false },
    { value: 30, label: "30 " + t("minutes_before"), isSelected: false },
    { value: 45, label: "45 " + t("minutes_before"), isSelected: false },
    { value: 60, label: "60 " + t("minutes_before"), isSelected: false },
  ]);

  const [error, setError] = useState();
  const [notificationPreferencesQuery] = useGetNotificationPreferences();
  const data = notificationPreferencesQuery.data;

  const providerDataQuery = useGetProviderData()[0];
  const isAnon = !providerDataQuery.data?.email;
  const IS_RO = localStorage.getItem("country") === "RO";

  useEffect(() => {
    if (data?.consultationReminderMin) {
      const selectedMinutes = Array.isArray(data.consultationReminderMin)
        ? data.consultationReminderMin
        : [data.consultationReminderMin];

      setMinutes((prev) =>
        prev.map((x) => ({
          ...x,
          isSelected: selectedMinutes.includes(x.value),
        }))
      );
    }
  }, [data]);

  const onUpdateError = (error) => {
    const { message: errorMessage } = useError(error);
    setError(errorMessage);
  };
  const onSuccess = () => {
    toast(t("success"));
  };
  const notificationsPreferencesMutation = useUpdateNotificationPreferences(
    onSuccess,
    onUpdateError
  );

  const handleChange = (field, value) => {
    const dataCopy = { ...data };
    dataCopy[field] = value;
    notificationsPreferencesMutation.mutate(dataCopy);
  };

  const handleConsultationReminderChange = (value) => {
    const minutesCopy = minutes.map((x) =>
      x.value === value ? { ...x, isSelected: !x.isSelected } : x
    );
    setMinutes(minutesCopy);
    handleChange(
      "consultationReminderMin",
      minutesCopy.filter((x) => x.isSelected).map((x) => x.value)
    );
  };

  return (
    <Block classes="notification-preferences">
      <div className="notification-preferences__content-wrapper">
        <div className="notification-preferences__content-wrapper__left">
          {notificationPreferencesQuery.isLoading &&
          providerDataQuery.isLoading &&
          !notificationPreferencesQuery.data ? (
            <Loading size="lg" />
          ) : (
            <Grid classes="notification-preferences__grid">
              {isAnon ? null : (
                <GridItem
                  xs={4}
                  md={8}
                  lg={12}
                  classes="notification-preferences__grid__item"
                >
                  <RadioButton
                    label={t("email")}
                    isChecked={data?.email}
                    setIsChecked={(value) => handleChange("email", value)}
                  />
                </GridItem>
              )}
              {!IS_RO && (
                <GridItem
                  xs={4}
                  md={8}
                  lg={12}
                  classes="notification-preferences__grid__item"
                >
                  <RadioButton
                    label={t("appointment")}
                    isChecked={data?.consultationReminder}
                    setIsChecked={(value) =>
                      handleChange("consultationReminder", value)
                    }
                  />
                  {data?.consultationReminder && (
                    <GridItem
                      xs={4}
                      md={8}
                      lg={12}
                      classes="notification-preferences__grid__item"
                    >
                      <CheckBoxSelectorGroup
                        options={minutes}
                        setOptions={handleConsultationReminderChange}
                        name="consultationReminderMin"
                        classes="notification-preferences__grid__item__checkbox-group"
                      />
                    </GridItem>
                  )}
                  {error ? <ErrorComponent message={error} /> : null}
                </GridItem>
              )}
            </Grid>
          )}
        </div>
        <div className="notification-preferences__content-wrapper__right">
          <img src={mascotCalmBlue} alt="mascot" />
        </div>
      </div>
    </Block>
  );
};
