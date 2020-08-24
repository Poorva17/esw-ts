import 'whatwg-fetch'
import {
  AkkaConnection,
  HttpConnection,
  LocationRemoved,
  LocationService,
  TrackingEvent
} from '../../src/clients/location'
import { authConnection, gatewayConnection } from '../../src/config/connections'
import { Prefix } from '../../src/models'
import { Option } from '../../src/utils/types'
import { LocationConfigWithAuth } from '../../test/helpers/LocationConfigWithAuth'
import { getToken } from '../utils/auth'
import { startComponent, startServices, stopServices } from '../utils/backend'
import { publicIPv4Address } from '../utils/networkUtils'

jest.setTimeout(100000)

const hcdPrefix = new Prefix('IRIS', 'testHcd')
let validToken: string
let locationServiceWithToken: LocationService
let locationServiceWithInvalidToken: LocationService
let locationService: LocationService

const getValueFromOption = <T>(value: Option<T>): T => {
  if (value === undefined) throw new Error('value is undefined')
  return value
}

const akkaHcdConnection: AkkaConnection = {
  prefix: hcdPrefix,
  componentType: 'HCD',
  connectionType: 'akka'
}

const httpHcdConnection: HttpConnection = {
  prefix: hcdPrefix,
  componentType: 'HCD',
  connectionType: 'http'
}
//TODO handle public location service with Auth
beforeAll(async () => {
  //todo: fix this console.error for jsdom errors
  console.error = jest.fn()
  // setup location service and gateway
  await startServices(['AAS', 'Gateway', 'LocationWithAuth'])
  await startComponent(hcdPrefix, 'HCD', 'testHcd.conf')
  validToken = await getToken('tmt-frontend-app', 'location-admin1', 'location-admin1', 'TMT')
  //Following 2 client connects to auth enabled location server instance
  locationServiceWithToken = LocationService(() => validToken, LocationConfigWithAuth)
  locationServiceWithInvalidToken = LocationService(() => undefined, LocationConfigWithAuth)
  //Following 1 client connects to auth disabled location server instance
  locationService = LocationService()
})

afterAll(async () => {
  await stopServices()
  jest.clearAllMocks()
})

describe('LocationService', () => {
  test('should be able to resolve a location for given connection | ESW-343, ESW-308', async () => {
    const gatewayLocation = getValueFromOption(
      await locationService.resolve(gatewayConnection, 10, 'seconds')
    )
    expect(gatewayLocation._type).toBe('HttpLocation')
  })

  test('should be able to list all the registered location | ESW-343, ESW-308', async () => {
    const locations = await locationService.list()

    expect(locations.length).toBe(4)

    const allExpectedConnections = [
      gatewayConnection,
      httpHcdConnection,
      akkaHcdConnection,
      authConnection
    ]
    const allExpectedTypes = ['AkkaLocation', 'HttpLocation']

    locations.forEach((loc) => {
      expect(allExpectedTypes).toContainEqual(loc._type)
      expect(allExpectedConnections).toContainEqual(loc.connection)
      expect(loc).toHaveProperty('uri')
    })
  })

  test('should be able to list all the registered location for given componentType | ESW-343, ESW-308', async () => {
    const locations = await locationService.listByComponentType('Service')
    const allExpectedConnections = [gatewayConnection, authConnection]

    const allExpectedTypes = ['HttpLocation']

    expect(locations.length).toBe(2)
    locations.forEach((loc) => {
      expect(allExpectedTypes).toContainEqual(loc._type)
      expect(allExpectedConnections).toContainEqual(loc.connection)
      expect(loc).toHaveProperty('uri')
    })
  })

  test('should be able to list all the registered location for given connectionType | ESW-343, ESW-308', async () => {
    const locations = await locationService.listByConnectionType('akka')

    expect(locations.length).toBe(1)
    expect(locations[0].connection).toEqual(akkaHcdConnection)
  })

  test('should be able to list all the registered location for given prefix | ESW-343, ESW-308', async () => {
    const locations = await locationService.listByPrefix(hcdPrefix)

    expect(locations.length).toBe(2)
    expect(locations.map((x) => x.connection)).toContainEqual(akkaHcdConnection)
    expect(locations.map((x) => x.connection)).toContainEqual(httpHcdConnection)
  })

  test('should be able to list all the registered location for given hostname | ESW-343, ESW-308', async () => {
    const locations = await locationService.listByHostname(publicIPv4Address())

    const allExpectedConnections = [
      gatewayConnection,
      httpHcdConnection,
      akkaHcdConnection,
      authConnection
    ]
    const allExpectedTypes = ['AkkaLocation', 'HttpLocation']

    expect(locations.length).toBe(4)
    locations.forEach((loc) => {
      expect(allExpectedTypes).toContainEqual(loc._type)
      expect(allExpectedConnections).toContainEqual(loc.connection)
      expect(loc).toHaveProperty('uri')
    })
  })

  test('should be able to find the location of given connection | ESW-343, ESW-308', async () => {
    const location = getValueFromOption(await locationService.find(akkaHcdConnection))
    expect(location._type).toBe('AkkaLocation')
    expect(location.connection).toEqual(akkaHcdConnection)
  })

  test('should be able to track a location from location server | ESW-343, ESW-308', () => {
    return new Promise(async (done) => {
      const expectedTrackingEvent: LocationRemoved = {
        _type: 'LocationRemoved',
        connection: gatewayConnection
      }

      const callBack = (trackingEvent: TrackingEvent) => {
        expect(trackingEvent).toEqual(expectedTrackingEvent)
        done()
      }
      locationService.track(gatewayConnection)(callBack)

      const response = await locationService.unregister(gatewayConnection)
      expect(response).toBe('Done')

      const location = await locationService.find(gatewayConnection)
      expect(location).toBeUndefined()
    })
  })

  test('should be able to unregister a location from location server | ESW-343, ESW-308', async () => {
    const hcdPrefix = new Prefix('IRIS', 'testHcd2')
    const connection = HttpConnection(hcdPrefix, 'HCD')
    await startComponent(hcdPrefix, 'HCD', 'testHcd2.conf')

    const response = await locationServiceWithToken.unregister(connection)
    expect(response).toBe('Done')

    const location = await locationService.find(connection)
    expect(location).toBeUndefined()
  })

  test('should return Unauthorized when unregister called without token to auth protected location service instance | ESW-343, ESW-308', async () => {
    // const location = await locationService.find(httpHcdConnection)
    // expect(location).toBeDefined()
    expect.assertions(3)
    await locationServiceWithInvalidToken.unregister(httpHcdConnection).catch((e) => {
      expect(e.status).toBe(401)
      expect(e.message).toBe('Unauthorized')
      expect(e.reason).toBe(
        'The resource requires authentication, which was not supplied with the request'
      )
    })
  })
})
