import { LocationService } from '../../src/clients/location'
import { resolve } from '../../src/clients/location/LocationUtils'
import { authConnection } from '../../src/config/Connections'
import { LocationConfigWithAuth } from '../../test/helpers/LocationConfigWithAuth'
import { BackendServices, ServiceName } from './backend'
import { eventually } from './eventually'

const locationService = LocationService()
const locationServiceWithAuth = LocationService(() => undefined, LocationConfigWithAuth)

const waitForLocationToUp = () => eventually(() => locationService.list())
const waitForLocationWithAuthToUp = () => eventually(() => locationServiceWithAuth.list())
const waitForAASToUp = () => eventually(() => resolve(authConnection))

export const waitForServicesToUp = async (serviceNames: ServiceName[]) => {
  await waitForLocationToUp()
  if (serviceNames.includes('AAS')) await waitForAASToUp()
  if (serviceNames.includes('LocationWithAuth')) await waitForLocationWithAuthToUp()

  const filteredServices = serviceNames.filter(
    (name) => name != 'AAS' && name != 'LocationWithAuth'
  )
  return await Promise.all(filteredServices.map((name) => resolve(BackendServices[name])))
}

export const waitForLocationToStop = () =>
  eventually(
    () =>
      new Promise((resolve, reject) => {
        locationService.list().then(reject).catch(resolve)
      })
  )
