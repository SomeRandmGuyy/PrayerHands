"""Subscription plans for Western and Chinese model providers.

Plan names match the providers' own consumer and platform offerings.
This app records which plan was signed in. It does not bill the account.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SubscriptionPlan:
    id: str
    name: str
    billing: str
    description: str

    @property
    def billing_label(self) -> str:
        labels = {
            'free': 'Free',
            'subscription': 'Subscription',
            'usage': 'Usage',
            'contract': 'Contract',
        }
        return labels.get(self.billing, self.billing)


@dataclass(frozen=True)
class ProviderDefinition:
    id: str
    name: str
    company: str
    region: str
    plans: tuple[SubscriptionPlan, ...]


def _plan(plan_id: str, name: str, billing: str, description: str) -> SubscriptionPlan:
    return SubscriptionPlan(plan_id, name, billing, description)


def _provider(
    provider_id: str,
    name: str,
    company: str,
    region: str,
    plans: tuple[SubscriptionPlan, ...],
) -> ProviderDefinition:
    return ProviderDefinition(provider_id, name, company, region, plans)


PROVIDERS: tuple[ProviderDefinition, ...] = (
    _provider(
        'openai',
        'OpenAI',
        'OpenAI',
        'western',
        (
            _plan(
                'free', 'ChatGPT Free', 'free', 'ChatGPT with the free usage allowance.'
            ),
            _plan(
                'go', 'ChatGPT Go', 'subscription', 'Lower-priced ChatGPT subscription.'
            ),
            _plan(
                'plus',
                'ChatGPT Plus',
                'subscription',
                'ChatGPT Plus monthly subscription.',
            ),
            _plan(
                'pro', 'ChatGPT Pro', 'subscription', 'ChatGPT Pro for higher limits.'
            ),
            _plan(
                'business',
                'ChatGPT Business',
                'subscription',
                'ChatGPT Business workspace subscription.',
            ),
            _plan(
                'enterprise',
                'ChatGPT Enterprise',
                'contract',
                'ChatGPT Enterprise agreement.',
            ),
            _plan('api', 'OpenAI API', 'usage', 'Platform API billed by usage.'),
        ),
    ),
    _provider(
        'anthropic',
        'Anthropic',
        'Anthropic',
        'western',
        (
            _plan('free', 'Claude Free', 'free', 'Claude on the free plan.'),
            _plan('pro', 'Claude Pro', 'subscription', 'Claude Pro subscription.'),
            _plan('max', 'Claude Max', 'subscription', 'Claude Max subscription.'),
            _plan('team', 'Claude Team', 'subscription', 'Claude Team workspace.'),
            _plan(
                'enterprise',
                'Claude Enterprise',
                'contract',
                'Claude Enterprise agreement.',
            ),
            _plan('api', 'Claude API', 'usage', 'Anthropic API billed by usage.'),
        ),
    ),
    _provider(
        'google',
        'Google Gemini',
        'Google',
        'western',
        (
            _plan(
                'free', 'Gemini Free', 'free', 'Gemini consumer app on the free plan.'
            ),
            _plan(
                'ai_plus',
                'Google AI Plus',
                'subscription',
                'Google AI Plus subscription.',
            ),
            _plan(
                'ai_pro', 'Google AI Pro', 'subscription', 'Google AI Pro subscription.'
            ),
            _plan(
                'ai_ultra',
                'Google AI Ultra',
                'subscription',
                'Google AI Ultra subscription.',
            ),
            _plan(
                'workspace',
                'Gemini for Workspace',
                'subscription',
                'Gemini included with a Google Workspace plan.',
            ),
            _plan('api', 'Gemini API', 'usage', 'Gemini API and AI Studio usage.'),
        ),
    ),
    _provider(
        'xai',
        'xAI',
        'xAI',
        'western',
        (
            _plan('free', 'Grok Free', 'free', 'Grok on the free plan.'),
            _plan('supergrok', 'SuperGrok', 'subscription', 'SuperGrok subscription.'),
            _plan(
                'heavy',
                'SuperGrok Heavy',
                'subscription',
                'SuperGrok Heavy subscription.',
            ),
            _plan('api', 'xAI API', 'usage', 'xAI API billed by usage.'),
        ),
    ),
    _provider(
        'microsoft',
        'Microsoft Copilot',
        'Microsoft',
        'western',
        (
            _plan('free', 'Copilot Free', 'free', 'Microsoft Copilot free plan.'),
            _plan('pro', 'Copilot Pro', 'subscription', 'Copilot Pro subscription.'),
            _plan(
                'm365',
                'Microsoft 365 Copilot',
                'subscription',
                'Copilot seat on Microsoft 365.',
            ),
            _plan(
                'foundry',
                'Azure AI Foundry',
                'usage',
                'Azure OpenAI and Foundry usage.',
            ),
        ),
    ),
    _provider(
        'amazon',
        'Amazon',
        'Amazon',
        'western',
        (
            _plan(
                'q_free',
                'Amazon Q Developer Free',
                'free',
                'Amazon Q Developer free tier.',
            ),
            _plan(
                'q_pro',
                'Amazon Q Developer Pro',
                'subscription',
                'Amazon Q Developer Pro subscription.',
            ),
            _plan('bedrock', 'Amazon Bedrock', 'usage', 'Bedrock model usage.'),
        ),
    ),
    _provider(
        'meta',
        'Meta',
        'Meta',
        'western',
        (
            _plan('free', 'Meta AI Free', 'free', 'Meta AI consumer access.'),
            _plan('llama_api', 'Llama API', 'usage', 'Llama API usage.'),
        ),
    ),
    _provider(
        'mistral',
        'Mistral AI',
        'Mistral AI',
        'western',
        (
            _plan('free', 'Le Chat Free', 'free', 'Le Chat free plan.'),
            _plan('pro', 'Le Chat Pro', 'subscription', 'Le Chat Pro subscription.'),
            _plan('team', 'Team', 'subscription', 'Mistral Team plan.'),
            _plan(
                'enterprise', 'Enterprise', 'contract', 'Mistral Enterprise agreement.'
            ),
            _plan('api', 'La Plateforme', 'usage', 'Mistral API billed by usage.'),
        ),
    ),
    _provider(
        'cohere',
        'Cohere',
        'Cohere',
        'western',
        (
            _plan('trial', 'Trial', 'free', 'Cohere trial access.'),
            _plan('production', 'Production', 'usage', 'Cohere production usage.'),
            _plan(
                'enterprise', 'Enterprise', 'contract', 'Cohere Enterprise agreement.'
            ),
        ),
    ),
    _provider(
        'perplexity',
        'Perplexity',
        'Perplexity',
        'western',
        (
            _plan('free', 'Free', 'free', 'Perplexity free plan.'),
            _plan('pro', 'Pro', 'subscription', 'Perplexity Pro subscription.'),
            _plan('max', 'Max', 'subscription', 'Perplexity Max subscription.'),
            _plan('enterprise', 'Enterprise', 'contract', 'Perplexity Enterprise.'),
            _plan('api', 'Sonar API', 'usage', 'Perplexity API billed by usage.'),
        ),
    ),
    _provider(
        'groq',
        'Groq',
        'Groq',
        'western',
        (
            _plan('free', 'GroqCloud Free', 'free', 'GroqCloud free developer tier.'),
            _plan('on_demand', 'On-demand', 'usage', 'GroqCloud paid usage.'),
            _plan('enterprise', 'Enterprise', 'contract', 'Groq enterprise agreement.'),
        ),
    ),
    _provider(
        'together',
        'Together AI',
        'Together AI',
        'western',
        (
            _plan('build', 'Build', 'usage', 'Together AI Build usage.'),
            _plan('scale', 'Scale', 'subscription', 'Together AI Scale plan.'),
            _plan('enterprise', 'Enterprise', 'contract', 'Together AI Enterprise.'),
        ),
    ),
    _provider(
        'fireworks',
        'Fireworks AI',
        'Fireworks AI',
        'western',
        (
            _plan('developer', 'Developer', 'usage', 'Fireworks developer usage.'),
            _plan('enterprise', 'Enterprise', 'contract', 'Fireworks Enterprise.'),
        ),
    ),
    _provider(
        'ai21',
        'AI21',
        'AI21',
        'western',
        (
            _plan('free', 'Free', 'free', 'AI21 free developer access.'),
            _plan('production', 'Production', 'usage', 'AI21 production usage.'),
            _plan('enterprise', 'Enterprise', 'contract', 'AI21 Enterprise.'),
        ),
    ),
    _provider(
        'nvidia',
        'NVIDIA',
        'NVIDIA',
        'western',
        (
            _plan('nim', 'NIM Developer', 'free', 'NVIDIA NIM developer access.'),
            _plan(
                'enterprise',
                'AI Enterprise',
                'contract',
                'NVIDIA AI Enterprise subscription.',
            ),
        ),
    ),
    _provider(
        'databricks',
        'Databricks',
        'Databricks',
        'western',
        (
            _plan('trial', 'Mosaic AI Trial', 'free', 'Databricks Mosaic AI trial.'),
            _plan('usage', 'Mosaic AI Usage', 'usage', 'Mosaic AI pay-as-you-go.'),
            _plan(
                'enterprise',
                'Enterprise',
                'contract',
                'Databricks enterprise agreement.',
            ),
        ),
    ),
    _provider(
        'ibm',
        'IBM watsonx',
        'IBM',
        'western',
        (
            _plan('trial', 'watsonx Trial', 'free', 'watsonx trial access.'),
            _plan(
                'essentials',
                'watsonx Essentials',
                'subscription',
                'watsonx Essentials.',
            ),
            _plan(
                'enterprise', 'watsonx Enterprise', 'contract', 'watsonx Enterprise.'
            ),
        ),
    ),
    _provider(
        'aleph_alpha',
        'Aleph Alpha',
        'Aleph Alpha',
        'western',
        (
            _plan('trial', 'Trial', 'free', 'Aleph Alpha trial.'),
            _plan('production', 'Production', 'usage', 'Aleph Alpha production usage.'),
            _plan(
                'enterprise',
                'Enterprise',
                'contract',
                'Aleph Alpha enterprise agreement.',
            ),
        ),
    ),
    _provider(
        'deepseek',
        'DeepSeek (深度求索)',
        'DeepSeek',
        'chinese',
        (
            _plan('free', 'DeepSeek Chat', 'free', 'DeepSeek chat on the free plan.'),
            _plan('api', 'DeepSeek API', 'usage', 'DeepSeek platform API usage.'),
        ),
    ),
    _provider(
        'alibaba',
        'Alibaba Qwen (通义千问)',
        'Alibaba Cloud',
        'chinese',
        (
            _plan(
                'free', 'Model Studio Free', 'free', 'Alibaba Model Studio free quota.'
            ),
            _plan('payg', 'Pay-as-you-go', 'usage', 'DashScope usage billing.'),
            _plan(
                'resource_pack',
                'Resource pack',
                'subscription',
                'Prepaid Model Studio resource pack.',
            ),
            _plan(
                'enterprise',
                'Enterprise',
                'contract',
                'Alibaba Cloud enterprise agreement.',
            ),
        ),
    ),
    _provider(
        'zhipu',
        'Zhipu GLM (智谱)',
        'Zhipu AI',
        'chinese',
        (
            _plan('free', 'BigModel Free', 'free', 'Zhipu BigModel free tier.'),
            _plan(
                'coding', 'GLM Coding', 'subscription', 'Zhipu GLM coding subscription.'
            ),
            _plan('standard', 'Standard', 'usage', 'BigModel standard usage.'),
            _plan(
                'enterprise', 'Enterprise', 'contract', 'Zhipu enterprise agreement.'
            ),
        ),
    ),
    _provider(
        'moonshot',
        'Moonshot Kimi (月之暗面)',
        'Moonshot AI',
        'chinese',
        (
            _plan('free', 'Kimi Free', 'free', 'Kimi free plan.'),
            _plan(
                'membership', 'Kimi Membership', 'subscription', 'Kimi paid membership.'
            ),
            _plan('api', 'Kimi API', 'usage', 'Moonshot platform API usage.'),
        ),
    ),
    _provider(
        'baidu',
        'Baidu ERNIE (文心一言)',
        'Baidu',
        'chinese',
        (
            _plan('free', 'ERNIE Free', 'free', 'ERNIE Bot free plan.'),
            _plan('standard', 'Qianfan Standard', 'usage', 'Qianfan standard usage.'),
            _plan(
                'enterprise',
                'Qianfan Enterprise',
                'contract',
                'Baidu Qianfan enterprise.',
            ),
        ),
    ),
    _provider(
        'bytedance',
        'ByteDance Doubao (豆包)',
        'ByteDance',
        'chinese',
        (
            _plan('free', 'Doubao Free', 'free', 'Doubao free plan.'),
            _plan(
                'membership',
                'Doubao Membership',
                'subscription',
                'Doubao paid membership.',
            ),
            _plan('ark', 'Volcengine Ark', 'usage', 'Volcengine Ark model usage.'),
            _plan(
                'enterprise',
                'Enterprise',
                'contract',
                'ByteDance enterprise agreement.',
            ),
        ),
    ),
    _provider(
        'tencent',
        'Tencent Hunyuan (混元)',
        'Tencent',
        'chinese',
        (
            _plan('free', 'Hunyuan Free', 'free', 'Hunyuan free quota.'),
            _plan('standard', 'Hunyuan Standard', 'usage', 'Hunyuan standard usage.'),
            _plan(
                'enterprise',
                'Hunyuan Enterprise',
                'contract',
                'Tencent Hunyuan enterprise.',
            ),
        ),
    ),
    _provider(
        'minimax',
        'MiniMax',
        'MiniMax',
        'chinese',
        (
            _plan('free', 'Free', 'free', 'MiniMax free tier.'),
            _plan('standard', 'Standard', 'usage', 'MiniMax standard usage.'),
            _plan(
                'enterprise', 'Enterprise', 'contract', 'MiniMax enterprise agreement.'
            ),
        ),
    ),
    _provider(
        'iflytek',
        'iFlytek Spark (讯飞星火)',
        'iFlytek',
        'chinese',
        (
            _plan('free', 'Spark Free', 'free', 'Spark free plan.'),
            _plan('pro', 'Spark Pro', 'subscription', 'Spark Pro subscription.'),
            _plan(
                'enterprise',
                'Spark Enterprise',
                'contract',
                'iFlytek enterprise agreement.',
            ),
        ),
    ),
    _provider(
        'stepfun',
        'StepFun (阶跃星辰)',
        'StepFun',
        'chinese',
        (
            _plan('free', 'Step Free', 'free', 'StepFun free tier.'),
            _plan('standard', 'Step Standard', 'usage', 'StepFun standard usage.'),
            _plan(
                'enterprise',
                'Step Enterprise',
                'contract',
                'StepFun enterprise agreement.',
            ),
        ),
    ),
    _provider(
        'baichuan',
        'Baichuan (百川)',
        'Baichuan',
        'chinese',
        (
            _plan('free', 'Baichuan Free', 'free', 'Baichuan free tier.'),
            _plan('standard', 'Baichuan Standard', 'usage', 'Baichuan standard usage.'),
            _plan(
                'enterprise',
                'Baichuan Enterprise',
                'contract',
                'Baichuan enterprise agreement.',
            ),
        ),
    ),
    _provider(
        'yi',
        '01.AI Yi (零一万物)',
        '01.AI',
        'chinese',
        (
            _plan('free', 'Yi Free', 'free', 'Yi free tier.'),
            _plan('api', 'Yi API', 'usage', '01.AI platform usage.'),
            _plan(
                'enterprise', 'Yi Enterprise', 'contract', '01.AI enterprise agreement.'
            ),
        ),
    ),
    _provider(
        'sensetime',
        'SenseNova (商汤日日新)',
        'SenseTime',
        'chinese',
        (
            _plan('free', 'SenseNova Free', 'free', 'SenseNova free tier.'),
            _plan(
                'standard', 'SenseNova Standard', 'usage', 'SenseNova standard usage.'
            ),
            _plan(
                'enterprise',
                'SenseNova Enterprise',
                'contract',
                'SenseTime enterprise agreement.',
            ),
        ),
    ),
    _provider(
        'siliconflow',
        'SiliconFlow (硅基流动)',
        'SiliconFlow',
        'chinese',
        (
            _plan('free', 'SiliconFlow Free', 'free', 'SiliconFlow free quota.'),
            _plan(
                'standard',
                'SiliconFlow Standard',
                'usage',
                'SiliconFlow standard usage.',
            ),
            _plan(
                'enterprise',
                'SiliconFlow Enterprise',
                'contract',
                'SiliconFlow enterprise agreement.',
            ),
        ),
    ),
    _provider(
        'huawei',
        'Huawei Pangu (华为盘古)',
        'Huawei',
        'chinese',
        (
            _plan('trial', 'ModelArts Trial', 'free', 'Huawei ModelArts trial.'),
            _plan(
                'standard', 'ModelArts Standard', 'usage', 'ModelArts standard usage.'
            ),
            _plan(
                'enterprise', 'Pangu Enterprise', 'contract', 'Huawei Pangu enterprise.'
            ),
        ),
    ),
    _provider(
        'skywork',
        'Skywork (昆仑万维)',
        'Kunlun',
        'chinese',
        (
            _plan('free', 'Skywork Free', 'free', 'Skywork free plan.'),
            _plan('pro', 'Skywork Pro', 'subscription', 'Skywork Pro subscription.'),
            _plan(
                'enterprise',
                'Skywork Enterprise',
                'contract',
                'Skywork enterprise agreement.',
            ),
        ),
    ),
)

_BY_ID = {provider.id: provider for provider in PROVIDERS}


def get_provider(provider_id: str) -> ProviderDefinition | None:
    return _BY_ID.get(provider_id)


def get_plan(provider: ProviderDefinition, plan_id: str) -> SubscriptionPlan | None:
    for plan in provider.plans:
        if plan.id == plan_id:
            return plan
    return None


def plan_login_path(provider_id: str, plan_id: str) -> str:
    """Relative sign-in path. The browser keeps whatever host it is on."""
    return (
        f'/api/provider-subscriptions/{provider_id}/login'
        f'?plan={plan_id}&return_to=%2Fsettings%2Fproviders'
    )
