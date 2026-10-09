import {
  buildRailwaySpinPlan,
  railwayGraphqlEndpoint,
  railwayProjectCreateMutation,
  validateProjectName,
} from '../../../app/lib/railway'

interface SpinBody {
  name?: string
  description?: string
  execute?: boolean
}

interface GraphqlProject {
  id?: string
  name?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SpinBody>(event)
  const name = (body?.name ?? '').trim()
  const nameError = validateProjectName(name)
  if (nameError) {
    throw createError({ statusCode: 400, statusMessage: nameError })
  }
  const description = (body?.description ?? 'Gentle Fist harness project').trim().slice(0, 240)
  const plan = buildRailwaySpinPlan(name, description)
  const token = String(useRuntimeConfig().railwayToken || '')
  if (!token) {
    return {
      connected: false,
      executed: false,
      status: 'not_connected' as const,
      plan,
    }
  }
  if (body?.execute !== true) {
    return {
      connected: true,
      executed: false,
      status: 'dry_run' as const,
      plan,
    }
  }

  const response = await fetch(railwayGraphqlEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: railwayProjectCreateMutation,
      variables: { input: plan.input },
    }),
    signal: AbortSignal.timeout(15000),
  })
  const payload = await response.json().catch(() => null) as {
    data?: { projectCreate?: GraphqlProject }
    errors?: { message?: string }[]
  } | null
  if (!response.ok || payload?.errors?.length) {
    const message = payload?.errors?.map((item) => item.message).filter(Boolean).join('; ')
      || `Railway answered HTTP ${response.status}`
    return {
      connected: true,
      executed: false,
      status: 'error' as const,
      message,
      plan,
    }
  }
  const created = payload?.data?.projectCreate
  return {
    connected: true,
    executed: true,
    status: 'created' as const,
    project: created ? { id: created.id ?? '', name: created.name ?? name } : null,
    plan,
  }
})
