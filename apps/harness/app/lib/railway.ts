/**
 * Railway Cloud hook contract for the harness.
 * Creating a project is additive. These ids are the existing desktop the UI embeds.
 * The spin route must not update or delete them.
 */
export const existingRailwayDesktop = {
  projectId: '5b464fbf-9e1c-4e0c-9c3f-61664702284c',
  projectName: 'precious-emotion',
  environmentId: 'e8f2321a-d53e-4c4e-a7e5-ed98b7e2ee08',
  environmentName: 'production',
  serviceId: '5ffcccd4-eeb0-4dea-9ed3-809fbfa0fad2',
  serviceName: 'desktop',
  image: 'linuxserver/webtop:ubuntu-xfce',
  url: 'https://desktop-production-b39d.up.railway.app',
  port: 3000,
} as const

export const railwayGraphqlEndpoint = 'https://backboard.railway.com/graphql/v2'

export const railwayProjectCreateMutation = `mutation projectCreate($input: ProjectCreateInput!) {
  projectCreate(input: $input) {
    id
    name
  }
}`

export interface RailwaySpinPlan {
  action: 'projectCreate'
  endpoint: typeof railwayGraphqlEndpoint
  mutation: string
  input: {
    name: string
    description: string
    isPublic: false
  }
  preserves: {
    projectId: string
    projectName: string
    environmentId: string
    serviceId: string
    serviceName: string
    note: string
  }
}

export function buildRailwaySpinPlan(name: string, description: string): RailwaySpinPlan {
  return {
    action: 'projectCreate',
    endpoint: railwayGraphqlEndpoint,
    mutation: railwayProjectCreateMutation,
    input: {
      name,
      description,
      isPublic: false,
    },
    preserves: {
      projectId: existingRailwayDesktop.projectId,
      projectName: existingRailwayDesktop.projectName,
      environmentId: existingRailwayDesktop.environmentId,
      serviceId: existingRailwayDesktop.serviceId,
      serviceName: existingRailwayDesktop.serviceName,
      note: 'This hook only creates a new project. It does not update, redeploy, or delete precious-emotion, the production environment, or the desktop service.',
    },
  }
}

const PROJECT_NAME = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,62}$/

export function validateProjectName(name: string): string | null {
  const trimmed = name.trim()
  if (!PROJECT_NAME.test(trimmed)) {
    return 'Use 1–63 letters, numbers, spaces, hyphens, or underscores.'
  }
  return null
}
