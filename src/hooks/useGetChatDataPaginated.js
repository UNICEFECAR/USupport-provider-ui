import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { messageSvc } from "@USupport-components-library/services";

const DEFAULT_PAGE_SIZE = 50;

/**
 * Paginated chat messages for read-only views (e.g. Activity History).
 * First page = latest messages; fetchNextPage loads older ones.
 */
export default function useGetChatDataPaginated(
  chatId,
  pageSize = DEFAULT_PAGE_SIZE
) {
  const query = useInfiniteQuery(
    ["chat-data-paginated", chatId, pageSize],
    async ({ pageParam }) => {
      const { data } = await messageSvc.getChatData(chatId, {
        limit: pageSize,
        before: pageParam,
      });

      return {
        chatId: data.chat_id,
        clientDetailId: data.client_detail_id,
        providerDetailId: data.provider_detail_id,
        messages: data.messages || [],
        hasMore: Boolean(data.hasMore),
        nextCursor: data.nextCursor ?? null,
      };
    },
    {
      enabled: !!chatId,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
    }
  );

  const messages = useMemo(() => {
    if (!query.data?.pages?.length) return [];
    // pages[0] = newest chunk; reverse so UI is chronological (oldest → newest)
    return [...query.data.pages]
      .reverse()
      .flatMap((page) => page.messages || []);
  }, [query.data]);

  const meta = query.data?.pages?.[0];

  return {
    ...query,
    isLoading: Boolean(chatId) && query.isLoading,
    messages,
    chatId: meta?.chatId,
    clientDetailId: meta?.clientDetailId,
    providerDetailId: meta?.providerDetailId,
  };
}

export { useGetChatDataPaginated };
