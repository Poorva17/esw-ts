import * as D from 'io-ts/lib/Decoder'
import type {
  AltAzCoord,
  CometCoord,
  Coord,
  EqCoord,
  EqFrame,
  MinorPlanetCoord,
  ProperMotion,
  RaDec,
  SolarSystemCoord,
  SolarSystemObject,
  Tag
} from '../models'
import { ciLiteral, Decoder } from './Decoder'

export const TagD: Decoder<Tag> = ciLiteral(
  'BASE',
  'OIWFS1',
  'OIWFS2',
  'OIWFS3',
  'OIWFS4',
  'ODGW1',
  'ODGW2',
  'ODGW3',
  'ODGW4',
  'GUIDER1',
  'GUIDER2'
)

export const SolarSystemObjectD: Decoder<SolarSystemObject> = ciLiteral(
  'Mercury',
  'Venus',
  'Moon',
  'Mars',
  'Jupiter',
  'Saturn',
  'Neptune',
  'Uranus',
  'Pluto'
)

export const EqFrameD: Decoder<EqFrame> = ciLiteral('ICRS', 'FK5')

export const RaDecD: Decoder<RaDec> = D.type({
  ra: D.number,
  dec: D.number
})

export const ProperMotionD: Decoder<ProperMotion> = D.type({
  pmx: D.number,
  pmy: D.number
})

export const EqCoordD: Decoder<EqCoord> = D.type({
  _type: ciLiteral('EqCoord'),
  tag: TagD,
  ra: D.number,
  dec: D.number,
  frame: EqFrameD,
  catalogName: D.string,
  pm: ProperMotionD
})

export const MinorPlanetCoordD: Decoder<MinorPlanetCoord> = D.type({
  _type: ciLiteral('MinorPlanetCoord'),
  tag: TagD,
  epoch: D.number,
  inclination: D.number,
  longAscendingNode: D.number,
  argOfPerihelion: D.number,
  meanDistance: D.number,
  eccentricity: D.number,
  meanAnomaly: D.number
})

export const SolarSystemCoordD: Decoder<SolarSystemCoord> = D.type({
  _type: ciLiteral('SolarSystemCoord'),
  tag: TagD,
  body: SolarSystemObjectD
})

export const CometCoordD: Decoder<CometCoord> = D.type({
  _type: ciLiteral('CometCoord'),
  tag: TagD,
  epochOfPerihelion: D.number,
  inclination: D.number,
  longAscendingNode: D.number,
  argOfPerihelion: D.number,
  perihelionDistance: D.number,
  eccentricity: D.number
})

export const AltAzCoordD: Decoder<AltAzCoord> = D.type({
  _type: ciLiteral('AltAzCoord'),
  tag: TagD,
  alt: D.number,
  az: D.number
})

export const CoordD: Decoder<Coord> = D.sum('_type')({
  EqCoord: EqCoordD,
  MinorPlanetCoord: MinorPlanetCoordD,
  SolarSystemCoord: SolarSystemCoordD,
  CometCoord: CometCoordD,
  AltAzCoord: AltAzCoordD
})
