import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ProviderSubscriptionService from "#/api/provider-subscription-service.api";

export const providerSubscriptionQueryKey = ["provider-subscriptions"] as const;

export function useProviderSubscriptions() {
  return useQuery({
    queryKey: providerSubscriptionQueryKey,
    queryFn: ProviderSubscriptionService.list,
  });
}

export function useDisconnectProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (providerId: string) =>
      ProviderSubscriptionService.disconnect(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerSubscriptionQueryKey });
    },
  });
}
