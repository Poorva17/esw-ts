import { mocked } from 'ts-jest/utils'
import { getPostEndPoint } from '../../../src/utils/Utils'
import { resolveGateway } from '../../../src/clients/gateway/ResolveGateway'
import { HttpTransport } from '../../../src/utils/HttpTransport'
import { AdminServiceImpl } from '../../../src/clients/admin/AdminServiceImpl'
import { AdminService } from '../../../src/clients/admin'

jest.mock('../../../src/clients/admin/AdminServiceImpl')
jest.mock('../../../src/clients/gateway/ResolveGateway')
jest.mock('../../../src/utils/Utils')
const postMockEndpoint = mocked(getPostEndPoint)
const mockResolveGateway = mocked(resolveGateway)
const mockImpl = mocked(AdminServiceImpl)

const postEndpoint = 'postEndpoint'
const uri = { host: '123', port: 1234 }
mockResolveGateway.mockResolvedValue(uri)
postMockEndpoint.mockReturnValue(postEndpoint)

const adminServiceImpl = new AdminServiceImpl(new HttpTransport(postEndpoint))

describe('Admin Service Factory', () => {
  test('create admin service | ESW-372', async () => {
    mockImpl.mockReturnValue(adminServiceImpl)
    const actualAdminService = await AdminService()

    expect(actualAdminService).toEqual(adminServiceImpl)
    expect(mockResolveGateway).toBeCalledTimes(1)
    expect(postMockEndpoint).toBeCalledWith(uri)
  })
})

afterAll(() => jest.resetAllMocks())
