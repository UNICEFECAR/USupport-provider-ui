import { useMutation } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

import { useError } from "./useError";

export const useAddPlatformRating = (onSuccess, onError) => {
  const addPlaftormRating = async (rating) => {
    const response = await providerSvc.addPlatformRating(rating);
    return response;
  };

  return useMutation(addPlaftormRating, {
    onSuccess,
    onError: (err) => {
      const { error } = useError(err);
      onError(error);
    },
  });
};
