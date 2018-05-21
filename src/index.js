// @flow

import { Graph, alg } from 'graphlib'
import {
  map, concat, join, reduce,
  tap, pipe,
  toPairs, prop
  } from 'ramda'
import { Maybe } from 'apropos'
import { getUsernames } from './get-usernames'

type Username = string
type NodesObj = { [key: Username]: { distance: number, predecessor?: Username } }
type NodesMap = Map<Username, { distance: number, predecessor?: Username }>
type Sinks = Username[]
type Chains = {
  sinks: Sinks,
  nodes: NodesMap
}

const startUsername = process.argv[2]

const startUsernameNormalized = startUsername[0] === '@'
  ? startUsername.slice(1)
  : startUsername

const printChain: NodesMap => void = pipe(
  tap(() => console.log('The longest chain:')),
  map => map.keys(),
  Array.from,
  map(concat('@')),
  join(' -> '),
  console.log
)

const printSink = (sink: Username, distance: string) =>
  console.log(`${startUsername} ----> ${sink} (distance: ${distance})`)

const printSinks = (sinks: Sinks, nodes: NodesMap) =>
  sinks.forEach(sink =>
    printSink(sink,
      Maybe.fromNullable(nodes.get(sink))
        .map(prop('distance'))
        .map(String)
        .fold(() => 'ERR', x => x)
    ))

const printNewLine = tap(() => console.log())

getChains(startUsernameNormalized)
  .then(printNewLine)
  .then(tap(obj => printSinks(obj.sinks, obj.nodes)))
  .then(printNewLine)
  .then(prop('nodes'))
  .then(printChain)

const objectToMap = obj =>
  new Map(toPairs(obj))

async function getChains (startUsername: Username): Promise<Chains> {
  const graph = new Graph({ directed: true })
  const visited: Set<string> = new Set()

  async function eachUsername (username: string, i: number = 0) {
    const usernames = await getUsernames(username)
    console.log(username, '->', usernames)

    const newUsernames = usernames.filter(user => !visited.has(user))

    const promises = newUsernames.map(newUsername => {
      visited.add(newUsername)
      graph.setEdge(username, newUsername)
      return eachUsername(newUsername, i + 1)
    })

    await Promise.all(promises)
  }

  await eachUsername(startUsername)

  const nodesObj: NodesObj = alg.dijkstra(graph, startUsername)
  const nodes: NodesMap = objectToMap(nodesObj)
  const sinks: Sinks = graph.sinks()

  return { nodes, sinks }
}
