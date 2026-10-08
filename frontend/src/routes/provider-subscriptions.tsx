import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { Typography } from "#/ui/typography";
import { BrandButton } from "#/components/features/settings/brand-button";
import {
  ProviderSubscription,
  SubscriptionPlan,
} from "#/api/provider-subscription-service.api";
import {
  useDisconnectProvider,
  useProviderSubscriptions,
} from "#/hooks/query/use-provider-subscriptions";
import {
  displayErrorToast,
  displaySuccessToast,
} from "#/utils/custom-toast-handlers";

function PlanRow({
  provider,
  plan,
}: {
  provider: ProviderSubscription;
  plan: SubscriptionPlan;
}) {
  const { t } = useTranslation();
  const connected = provider.connection?.plan_id === plan.id;

  return (
    <div className="flex flex-col gap-2 border border-tertiary rounded-md p-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white">{plan.name}</span>
          <span className="text-xs text-[#A3A3A3]">{plan.billing_label}</span>
          {connected && (
            <span
              className="text-xs text-primary"
              data-testid={`connected-${provider.id}`}
            >
              {t(I18nKey.PROVIDERS$CONNECTED)}
            </span>
          )}
        </div>
        <p className="text-xs text-[#A3A3A3]">{plan.description}</p>
      </div>
      <a
        href={plan.login_path}
        data-testid={`sign-in-${provider.id}-${plan.id}`}
        className="shrink-0 text-sm font-semibold text-[#0D0F11] bg-primary rounded-sm px-3 py-2 text-center hover:opacity-80"
      >
        {t(I18nKey.PROVIDERS$SIGN_IN)}
      </a>
    </div>
  );
}

function ProviderCard({ provider }: { provider: ProviderSubscription }) {
  const { t } = useTranslation();
  const { mutate: disconnect, isPending } = useDisconnectProvider();

  return (
    <article
      data-testid={`provider-${provider.id}`}
      className="flex flex-col gap-3 bg-[#25272D] border border-tertiary rounded-xl p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            {provider.name}
          </h3>
          <p className="text-xs text-[#A3A3A3]">{provider.company}</p>
        </div>
        {provider.connection && (
          <BrandButton
            testId={`disconnect-${provider.id}`}
            type="button"
            variant="secondary"
            isDisabled={isPending}
            onClick={() =>
              disconnect(provider.id, {
                onSuccess: () =>
                  displaySuccessToast(t(I18nKey.PROVIDERS$DISCONNECTED)),
                onError: () =>
                  displayErrorToast(t(I18nKey.PROVIDERS$DISCONNECT_FAILED)),
              })
            }
          >
            {t(I18nKey.PROVIDERS$DISCONNECT)}
          </BrandButton>
        )}
      </div>
      {provider.connection && (
        <p
          className="text-xs text-white"
          data-testid={`account-${provider.id}`}
        >
          {provider.connection.plan_name} · {provider.connection.account_name}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {provider.plans.map((plan) => (
          <PlanRow key={plan.id} provider={provider} plan={plan} />
        ))}
      </div>
    </article>
  );
}

function ProviderSubscriptionsScreen() {
  const { t } = useTranslation();
  const { data: providers, isLoading, isError } = useProviderSubscriptions();

  const grouped = useMemo(() => {
    const western = (providers ?? []).filter(
      (item) => item.region === "western",
    );
    const chinese = (providers ?? []).filter(
      (item) => item.region === "chinese",
    );
    return { western, chinese };
  }, [providers]);

  return (
    <div
      data-testid="provider-subscriptions-screen"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Typography.H2>{t(I18nKey.PROVIDERS$TITLE)}</Typography.H2>
        <p className="text-sm text-[#A3A3A3] max-w-[720px]">
          {t(I18nKey.PROVIDERS$DESCRIPTION)}
        </p>
      </div>
      {isLoading && (
        <p className="text-sm text-white">{t(I18nKey.PROVIDERS$LOADING)}</p>
      )}
      {isError && (
        <p className="text-sm text-danger">
          {t(I18nKey.PROVIDERS$LOAD_FAILED)}
        </p>
      )}
      {!isLoading && !isError && (
        <>
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-300">
              {t(I18nKey.PROVIDERS$WESTERN)}
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {grouped.western.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-300">
              {t(I18nKey.PROVIDERS$CHINESE)}
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {grouped.chinese.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ProviderSubscriptionsScreen;
