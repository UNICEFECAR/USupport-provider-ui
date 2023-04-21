import { useMutation } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

export function useAddAnswerToQuestion(onSuccess, onError) {
  /**
   *
   * @returns
   */

  const addAnswerToQuestion = async (data) => {
    const response = await providerSvc.addAnswerToQuestion(data);
    return response.data;
  };

  const addAnswerToQuestionMutation = useMutation(addAnswerToQuestion, {
    onSuccess: onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return addAnswerToQuestionMutation;
}
