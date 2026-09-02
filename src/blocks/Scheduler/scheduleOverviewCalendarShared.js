export function isSameCalendarDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function consultationCountOnDay(consultationsRaw, date) {
  return consultationsRaw.filter((c) => {
    const d = new Date(c.time);
    return isSameCalendarDay(d, date);
  }).length;
}

export function hasOpenSlotOnDay(hours, getSlotDataForHour, date) {
  return hours.some((hour) => {
    const rows = getSlotDataForHour(hour, date);
    return rows.some(
      (row) =>
        !row.consultation &&
        row.availabilityStatus !== "unavailable" &&
        !row.isPastDay,
    );
  });
}

export function getDayAvailabilityState({
  consultationsRaw,
  hours,
  getSlotDataForHour,
  date,
}) {
  const count = consultationCountOnDay(consultationsRaw, date);
  const hasAppt = count > 0;
  const isAvailable = hasAppt || hasOpenSlotOnDay(hours, getSlotDataForHour, date);

  return { count, hasAppt, isAvailable };
}

export function isPastDateWithoutAppointment(date, consultationsRaw) {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const hasAppt = consultationCountOnDay(consultationsRaw, date) > 0;
  return date < startOfToday && !hasAppt;
}
