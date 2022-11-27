import { useMutation } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

export default function useCancelConsultation(onSuccess, onError) {
  const cancelConsultation = async (consultationId) => {
    const res = await providerSvc.cancelConsultation(consultationId);
    return res;
  };

  const cancelConsultationMutation = useMutation(cancelConsultation, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return cancelConsultationMutation;
}

export { useCancelConsultation };
