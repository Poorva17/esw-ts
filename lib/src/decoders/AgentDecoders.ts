import * as D from 'io-ts/lib/Decoder'
import type { Killed, KillResponse, Spawned, SpawnResponse } from '../clients/agent-service'
import { FailedD } from './CommonDecoders'
import { ciLiteral, Decoder } from './Decoder'

const SpawnedD: Decoder<Spawned> = D.type({
  _type: ciLiteral('Spawned')
})

const KilledD: Decoder<Killed> = D.type({
  _type: ciLiteral('Killed')
})

export const SpawnResponseD: Decoder<SpawnResponse> = D.sum('_type')({
  Spawned: SpawnedD,
  Failed: FailedD
})

export const KillResponseD: Decoder<KillResponse> = D.sum('_type')({
  Killed: KilledD,
  Failed: FailedD
})
