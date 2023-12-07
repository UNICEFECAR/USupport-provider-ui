import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import {
  Block,
  Grid,
  GridItem,
  Toggle,
  Loading,
  CheckBoxSelectorGroup,
  Error as ErrorComponent,
} from "@USupport-components-library/src";
import {
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
  useError,
} from "#hooks";

import "./notification-preferences.scss";

/**
 * NotificationPreferences
 *
 * Notification preferences block
 *
 * @return {jsx}
 */
export const NotificationPreferences = () => {
  const { t } = useTranslation("notification-preferences");

  const [minutes, setMinutes] = useState([
    { value: 15, label: "15 " + t("minutes_before"), isSelected: false },
    { value: 30, label: "30 " + t("minutes_before"), isSelected: false },
    { value: 45, label: "45 " + t("minutes_before"), isSelected: false },
    { value: 60, label: "60 " + t("minutes_before"), isSelected: false },
  ]);

  const [error, setError] = useState();
  const [notificationPreferencesQuery] = useGetNotificationPreferences();
  const { data } = notificationPreferencesQuery;

  useEffect(() => {
    if (data) {
      setMinutes(
        minutes.map((x) => ({
          ...x,
          isSelected: data.consultationReminderMin.includes(x.value),
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
    const minutesCopy = [...minutes];
    minutesCopy.forEach((x) => {
      if (value === x.value) {
        x.isSelected = !x.isSelected;
      }
    });
    setMinutes(minutesCopy);
    console.log(minutesCopy.filter((x) => x.isSelected).map((x) => x.value));
    handleChange(
      "consultationReminderMin",
      minutesCopy.filter((x) => x.isSelected).map((x) => x.value)
    );
  };

  return (
    <Block classes="notification-preferences">
      {notificationPreferencesQuery.isLoading &&
      !notificationPreferencesQuery.data ? (
        <Loading size="lg" />
      ) : (
        <Grid classes="notification-preferences__grid">
          <GridItem
            xs={4}
            md={8}
            lg={12}
            classes="notification-preferences__grid__item"
          >
            <p className="paragraph">{t("email")}</p>
            <Toggle
              isToggled={data?.email}
              setParentState={(value) => handleChange("email", value)}
            />
          </GridItem>
          <GridItem
            xs={4}
            md={8}
            lg={12}
            classes="notification-preferences__grid__item"
          >
            <p className="paragraph">{t("appointment")}</p>
            <Toggle
              isToggled={
                data?.consultationReminder ? data?.consultationReminder : false
              }
              setParentState={(value) =>
                handleChange("consultationReminder", value)
              }
            />
            {data?.consultationReminder && (
              <CheckBoxSelectorGroup
                options={minutes}
                setOptions={handleConsultationReminderChange}
                name="consultationReminderMin"
                classes="notification-preferences__grid__checkbox-group"
              />
            )}
            {error ? <ErrorComponent message={error} /> : null}
          </GridItem>
        </Grid>
      )}
    </Block>
  );
};
