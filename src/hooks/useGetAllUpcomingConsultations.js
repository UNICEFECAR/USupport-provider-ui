import { useInfiniteQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { useState } from "react";

export default function useGetAllUpcomingConsultations() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState();

  const fetchAllConsultations = async ({ pageParam = 1 }) => {
    const response = await providerSvc.getAllUpcomingConsultations(pageParam);

    let data = response.data.consultations;

    setCurrentPage(pageParam);
    setTotalCount(Number(response.data.totalCount));

    return data
      ?.filter((consultation) => {
        const today = new Date();
        const consultationDate = new Date(consultation.time);
        if (
          today.getFullYear() === consultationDate.getFullYear() &&
          today.getMonth() === consultationDate.getMonth() &&
          today.getDate() === consultationDate.getDate()
        ) {
          return false;
        }
        return true;
      })
      .map((consultation) => ({
        consultationId: consultation.consultation_id,
        chatId: consultation.chat_id,
        clientDetailId: consultation.client_detail_id,
        clientName: consultation.client_name,
        image: consultation.client_image,
        timestamp: new Date(consultation.time).getTime(),
        status: consultation.status,
        price: consultation.price,
      }));
  };

  const query = useInfiniteQuery(
    ["upcoming-consultations"],
    fetchAllConsultations,
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return undefined;
        return pages.length + 1;
      },
    }
  );

  return [query, currentPage, totalCount];
}

export { useGetAllUpcomingConsultations };
