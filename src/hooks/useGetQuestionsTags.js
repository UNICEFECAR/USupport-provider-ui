import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export function useGetQuestionsTags(onSuccess) {
  const getQuestionsTags = async () => {
    const { data } = await providerSvc.getQuestionTags("all");
    return data.map((item) => {
      return { label: item.tag, id: item.tag_id };
    });
  };

  const getQuestionsTagsQuery = useQuery(
    ["getQuestionsTags"],
    getQuestionsTags,
    {
      onSuccess: onSuccess,
    }
  );

  return getQuestionsTagsQuery;
}
