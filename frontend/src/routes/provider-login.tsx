import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ProviderSubscriptionService, {
  isRelativeAppPath,
} from "#/api/provider-subscription-service.api";
import { BrandButton } from "#/components/features/settings/brand-button";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { I18nKey } from "#/i18n/declaration";
import { displayErrorToast } from "#/utils/custom-toast-handlers";
import { retrieveAxiosErrorMessage } from "#/utils/retrieve-axios-error-message";

function ProviderLoginScreen() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const state = searchParams.get("state") ?? "";
  const [accountName, setAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const session = useQuery({
    queryKey: ["provider-login", state],
    queryFn: () => ProviderSubscriptionService.readLogin(state),
    enabled: state.length > 0,
    retry: false,
  });

  const finish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state || submitting) return;
    setSubmitting(true);
    try {
      const result = await ProviderSubscriptionService.completeLogin(
        state,
        accountName,
      );
      const next = isRelativeAppPath(result.return_to)
        ? result.return_to
        : "/settings/providers";
      window.location.assign(next);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? retrieveAxiosErrorMessage(error)
        : t(I18nKey.ERROR$GENERIC);
      displayErrorToast(message);
      setSubmitting(false);
    }
  };

  const browserOrigin =
    typeof window === "undefined" ? "" : window.location.origin;

  return (
    <main
      data-testid="provider-login-screen"
      className="min-h-full flex items-center justify-center p-6"
    >
      <div className="w-full max-w-[480px] bg-[#25272D] border border-tertiary rounded-xl p-6 flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-white">
          {t(I18nKey.PROVIDERS$LOGIN_TITLE)}
        </h1>
        {!state && (
          <p className="text-sm text-danger">
            {t(I18nKey.PROVIDERS$INVALID_LINK)}
          </p>
        )}
        {session.isLoading && (
          <p className="text-sm text-white">{t(I18nKey.PROVIDERS$LOADING)}</p>
        )}
        {session.isError && (
          <p className="text-sm text-danger">
            {t(I18nKey.PROVIDERS$INVALID_LINK)}
          </p>
        )}
        {session.data && (
          <form className="flex flex-col gap-4" onSubmit={finish}>
            <div className="flex flex-col gap-1">
              <p
                className="text-sm text-white"
                data-testid="provider-login-plan"
              >
                {session.data.provider_name} · {session.data.plan_name}
              </p>
              <p className="text-xs text-[#A3A3A3]">
                {session.data.plan_description}
              </p>
              <p className="text-xs text-[#A3A3A3]">
                {session.data.billing_label}
              </p>
            </div>
            <p
              className="text-xs text-[#A3A3A3]"
              data-testid="provider-login-host"
            >
              {t(I18nKey.PROVIDERS$ON_THIS_SERVER)} {browserOrigin}
            </p>
            <p className="text-xs text-[#A3A3A3]">
              {t(I18nKey.PROVIDERS$LOGIN_NOTE)}
            </p>
            <SettingsInput
              testId="provider-login-account"
              name="account-name"
              label={t(I18nKey.PROVIDERS$ACCOUNT_NAME)}
              type="text"
              required
              value={accountName}
              onChange={setAccountName}
              className="w-full"
            />
            <BrandButton
              testId="provider-login-continue"
              type="submit"
              variant="primary"
              isDisabled={submitting || accountName.trim().length === 0}
              className="w-full"
            >
              {t(I18nKey.PROVIDERS$CONTINUE)}
            </BrandButton>
          </form>
        )}
        <Link
          to="/settings/providers"
          className="text-sm text-white underline underline-offset-2"
          data-testid="provider-login-back"
        >
          {t(I18nKey.PROVIDERS$BACK)}
        </Link>
      </div>
    </main>
  );
}

export default ProviderLoginScreen;
