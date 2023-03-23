import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetCalendarData(startDate) {
  const getCalendarData = async () => {
    const response = await providerSvc.getCalendarData(startDate);
    const data = response.data;

    const formattedData = new Map();

    const consultations = new Map();
    const slots = new Map();

    for (let i = 0; i < data.consultations.length; i++) {
      const consultation = new Date(data.consultations[i]);
      const key = consultation.toLocaleDateString();

      if (!consultations.has(key)) {
        consultations.set(key, 1);
      } else {
        consultations.set(key, consultations.get(key) + 1);
      }
    }

    const slotsData = [...data.slots, ...data.campaign_slots];
    for (let i = 0; i < slotsData.length; i++) {
      const slot = slotsData[i];
      const slotTime =
        typeof slot === "object"
          ? new Date(slotsData[i].time)
          : new Date(slotsData[i]);

      const key = slotTime.toLocaleDateString();

      if (!slots.has(key)) {
        slots.set(key, 1);
      } else {
        slots.set(key, slots.get(key) + 1);
      }
    }
    formattedData.set("consultations", consultations);
    formattedData.set("slots", slots);
    return formattedData;
  };

  const getCalendarDataQuery = useQuery(["calendar-data"], getCalendarData, {
    onError: (error) => console.log(error),
  });

  return getCalendarDataQuery;
}

export { useGetCalendarData };
