import { GatewayConnection } from '../../../src/clients/gateway/ResolveGateway'
import { HttpLocation } from '../../../src/clients/location'
import { SequencerService, Step, StepList, StepStatus } from '../../../src/clients/sequencer'
import {
  ComponentId,
  Prefix,
  SequenceCommand,
  Setup,
  SubmitResponse,
  Wait
} from '../../../src/models'
import { mocked } from 'ts-jest/utils'
import { post } from '../../../src/utils/Http'

const componentId = new ComponentId(new Prefix('ESW', 'MoonNight'), 'Sequencer')
const sequencer = new SequencerService(componentId, () => '')

const eswTestPrefix = Prefix.fromString('ESW.test')
const setupCommand = new Setup(eswTestPrefix, 'command-1', [])
const waitCommand = new Wait(eswTestPrefix, 'command-1', [])
const commands: SequenceCommand[] = [setupCommand, waitCommand]
const sequence: SequenceCommand[] = [setupCommand]

jest.mock('../../../src/utils/Http')
const postMockFn = mocked(post, true)
const uri = 'http://localhost:8080'
const gatewayLocation: HttpLocation = { _type: 'HttpLocation', connection: GatewayConnection, uri }
const Ok = { _type: 'Ok' }

beforeEach(() => {
  postMockFn.mockResolvedValueOnce([gatewayLocation])
})
describe('SequencerService', () => {
  test('should load a sequence in given sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.loadSequence(sequence)
    expect(res).toEqual(Ok)
  })

  test('should start the sequence in given sequencer | ESW-307', async () => {
    const completedResponse: SubmitResponse = {
      _type: 'Completed',
      runId: '1234124',
      result: { paramSet: [] }
    }

    postMockFn.mockResolvedValueOnce(completedResponse)

    const res = await sequencer.startSequence()
    expect(res).toEqual(completedResponse)
  })

  test('should add given commands in the sequence of given sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.add(commands)
    expect(res).toEqual(Ok)
  })

  test('should prepend given commands in the sequence of given sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.prepend(commands)
    expect(res).toEqual(Ok)
  })

  test('should replace given id command with given commands | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.replace('id-123', commands)
    expect(res).toEqual(Ok)
  })

  test('should insert the given commands after given command of given id | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.insertAfter('id-123', commands)
    expect(res).toEqual(Ok)
  })

  test('should delete the given command from sequence | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.delete('id-123')
    expect(res).toEqual(Ok)
  })

  test('should add a breakPoint on the given command from sequence | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.addBreakpoint('id-123')
    expect(res).toEqual(Ok)
  })

  test('should remove the breakPoint on the given command from sequence | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.removeBreakpoint('id-123')
    expect(res).toEqual(Ok)
  })

  test('should reset the sequence in given sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.reset()
    expect(res).toEqual(Ok)
  })

  test('should resume the sequence in given sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.resume()
    expect(res).toEqual(Ok)
  })

  test('should pause the sequence in given sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.pause()
    expect(res).toEqual(Ok)
  })

  test('should get a step list from sequencer | ESW-307', async () => {
    const Pending: StepStatus = { _type: 'Pending' }
    const step: Step = {
      id: 'bfec413e-e377-4e3a-8737-3e625d694bd1',
      command: setupCommand,
      status: Pending,
      hasBreakpoint: false
    }
    const stepList: StepList = [step]

    postMockFn.mockResolvedValueOnce(stepList)

    const res = await sequencer.getSequence()
    expect(res).toEqual(stepList)
  })

  test('should return whether a sequencer is available | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(true)

    const res = await sequencer.isAvailable()
    expect(res).toEqual(true)
  })

  test('should return whether a sequencer is online | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(true)

    const res = await sequencer.isOnline()
    expect(res).toEqual(true)
  })

  test('should get a go online response from sequencer on GoOnline | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.goOnline()
    expect(res).toEqual(Ok)
  })

  test('should get a go offline response from sequencer on GoOffline | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.goOffline()
    expect(res).toEqual(Ok)
  })

  test('should abort a sequence from sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.abortSequence()
    expect(res).toEqual(Ok)
  })

  test('should stop a sequence from sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.stop()
    expect(res).toEqual(Ok)
  })

  test('should send diagnostic mode to sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.diagnosticMode(new Date('2020-10-08'), 'hint for diagnostic mode')
    expect(res).toEqual(Ok)
  })

  test('should send operations mode to sequencer | ESW-307', async () => {
    postMockFn.mockResolvedValueOnce(Ok)

    const res = await sequencer.operationsMode()
    expect(res).toEqual(Ok)
  })
})

afterEach(() => {
  jest.clearAllMocks()
})
