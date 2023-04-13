import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export function useGetQuestions(type) {
  /**
   *
   * @returns
   */

  const getQuestions = async () => {
    const { data } = await providerSvc.getQuestions(type);

    return data.map((question) => {
      return {
        answerCreatedAt: question.answer_created_at,
        answerId: question.answer_id,
        answerText: question.answer_text,
        answerTitle: question.answer_title,
        dislikes: question.dislikes,
        isDisliked: question.isDisliked,
        isLiked: question.isLiked,
        likes: question.likes,
        providerData: question.providerData,
        providerDetailId: question.provider_detail_id,
        questionCreatedAt: question.question_created_at,
        questionId: question.question_id,
        question: question.question,
        tags: question.tags,
      };
    });
  };

  const getQuestionsQuery = useQuery(["getQuestions", type], getQuestions);

  return getQuestionsQuery;
}
