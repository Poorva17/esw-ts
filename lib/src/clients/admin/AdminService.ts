import { ComponentId } from '../../models'
import { HttpTransport } from '../../utils/HttpTransport'
import { getPostEndPoint } from '../../utils/Utils'
import { resolveGateway } from '../gateway/ResolveGateway'
import { Done } from '../location'
import { Level, LogMetadata } from '../logger'
import { AdminServiceImpl } from './AdminServiceImpl'

export interface AdminService {
  getLogMetadata(componentId: ComponentId): Promise<LogMetadata>

  setLogLevel(componentId: ComponentId, level: Level): Promise<Done>
}

export const AdminService: () => Promise<AdminService> = async () => {
  const { host, port } = await resolveGateway()
  const postEndpoint = getPostEndPoint({ host, port })
  return new AdminServiceImpl(new HttpTransport(postEndpoint))
}
