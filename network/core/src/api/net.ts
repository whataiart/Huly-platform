export type ContainerUuid = string & { _containerUuid: true }
export type ContainerKind = string & { _containerKind: true }
export type AgentUuid = string & { _networkAgentUuid: true }
export type ContainerEndpointRef = string & { _containerEndpointRef: true }

export interface ContainerInfo {
  uuid: ContainerUuid
  endpoint: ContainerEndpointRef
  agentId: AgentUuid
}

export enum ContainerState {
  starting = 'starting',
  active = 'active',
  stopping = 'stopping',
  stopped = 'stopped',
  error = 'error'
}

export interface ContainerEvent {
  state?: ContainerState

  // A map of container

  // A reference cpu information for container usage.
  cpu: { current: number, total: number }

  // A reference memory information for container usage.
  memory: { current: number, total: number }
}

export interface AgentEvent {
  // A change to containers
  containers: Record<ContainerKind, number>

  // A reference cpu information for container usage.
  cpu: { current: number, total: number }

  // A reference memory information for container usage.
  memory: { current: number, total: number }
}

interface ContainerRequest {
  uptime?: number // A container uptime in seconds, before automatic shutdown.
  extra?: Record<string, any> // Extra parameters for container start
}

export interface ContainerAPI {
  // Get/Start of required container kind on agent
  get: (uuid: ContainerUuid, kind: ContainerKind, options?: ContainerRequest) => Promise<ContainerEndpointRef>

  list: (kind: ContainerKind) => Promise<ContainerInfo[]>

  // Send some data to container
  send: (target: ContainerUuid, source: ContainerUuid, data: ArrayBufferLike) => Promise<void>
}

export interface NetworkAgent extends ContainerAPI {
  uuid: AgentUuid

  // A supported set of container kinds supported to be managed by the agent
  kinds: ContainerKind[]

  // Container event
  onContainer?: (uuid: ContainerUuid, event: ContainerEvent) => void

  onAgent?: (info: AgentEvent) => void
}

export interface NetworkClient extends ContainerAPI {

  // Agent API's
  register: (uuid: AgentUuid, agent: NetworkAgent) => Promise<void>

  agents: NetworkAgent[]

  // A full uniq set of supported container kinds.
  kinds: ContainerKind[]

  // Establish a recoverable connection to endpoint.
  connect: (endpoint: ContainerEndpointRef) => Promise<ContainerEndpoint>
}

// A request/reponse interface to container.
export interface ContainerEndpoint {
  send: (data: ArrayBufferLike) => Promise<ArrayBufferLike>

  // broadcast events.
  on?: (data: ArrayBufferLike) => Promise<void>
}
