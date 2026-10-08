import { openHands } from "./open-hands-axios";

export interface SubscriptionPlan {
  id: string;
  name: string;
  billing: string;
  billing_label: string;
  description: string;
  login_path: string;
}

export interface ProviderConnection {
  provider_id: string;
  plan_id: string;
  plan_name: string;
  account_name: string;
  status: string;
  connected_at: string;
}

export interface ProviderSubscription {
  id: string;
  name: string;
  company: string;
  region: "western" | "chinese";
  plans: SubscriptionPlan[];
  connection: ProviderConnection | null;
}

export interface ProviderLoginSession {
  state: string;
  provider_id: string;
  provider_name: string;
  company: string;
  region: "western" | "chinese";
  plan_id: string;
  plan_name: string;
  plan_description: string;
  billing: string;
  billing_label: string;
  return_to: string;
  public_base_url: string;
  login_path: string;
  login_url: string;
}

export interface CompletedProviderLogin {
  provider_id: string;
  plan_id: string;
  plan_name: string;
  account_name: string;
  return_to: string;
  connection: ProviderConnection;
}

/**
 * Keep navigation on this app. Absolute and protocol-relative URLs are rejected.
 */
export function isRelativeAppPath(path: string): boolean {
  return (
    path.startsWith("/") && !path.startsWith("//") && !path.includes("://")
  );
}

class ProviderSubscriptionService {
  static async list(): Promise<ProviderSubscription[]> {
    const { data } = await openHands.get<{ providers: ProviderSubscription[] }>(
      "/api/provider-subscriptions",
    );
    return data.providers;
  }

  static async readLogin(state: string): Promise<ProviderLoginSession> {
    const { data } = await openHands.get<ProviderLoginSession>(
      `/api/provider-subscriptions/sessions/${encodeURIComponent(state)}`,
    );
    return data;
  }

  static async completeLogin(
    state: string,
    accountName: string,
  ): Promise<CompletedProviderLogin> {
    const { data } = await openHands.post<CompletedProviderLogin>(
      `/api/provider-subscriptions/sessions/${encodeURIComponent(state)}/complete`,
      { account_name: accountName },
    );
    return data;
  }

  static async disconnect(providerId: string): Promise<void> {
    await openHands.post(
      `/api/provider-subscriptions/${encodeURIComponent(providerId)}/disconnect`,
    );
  }
}

export default ProviderSubscriptionService;
