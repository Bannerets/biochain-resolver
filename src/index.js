// @flow

import Graph from 'graph.js/dist/graph.full.js'
import {
  map, concat, join, head, last,
  tap, pipe,
  prop
} from 'ramda'
import { getUsernames } from './get-usernames'

type Username = string
type Sinks = Username[]
type Chains = {
  distances: [Username, number][],
  longestPath: Username[]
}

const startUsername = process.argv[2]

const startUsernameNormalized = startUsername[0] === '@'
  ? startUsername.slice(1)
  : startUsername

const printChain: Username[] => void = pipe(
  map(concat('@')),
  join(' -> '),
  console.log
)

const printLongestChain: Username[] => void = pipe(
  tap(() => console.log('The longest chain:')),
  printChain
)

const printDistance = (user1: Username, user2: Username, distance: string) =>
  console.log(`@${user1} ----> @${user2} (distance: ${distance})`)

const printDistances = (arr: [Username, number][]) => arr
  .forEach(([ username, distance ]) =>
    printDistance(startUsernameNormalized, username, distance.toString()))

const printNewLine = tap(() => console.log())

getChains(startUsernameNormalized)
  .then(pipe(
    printNewLine,
    tap(pipe(
      prop('distances'),
      printDistances
    )),
    printNewLine,
    prop('longestPath'),
    printLongestChain
  ))

async function getChains (startUsername: Username): Promise<Chains> {
  const graph = new Graph()

  async function eachUsername (username: string, i: number = 0) {
    const fetchedUsernames = await getUsernames(username)
    console.log(username, '->', fetchedUsernames)

    const newUsernames = fetchedUsernames.filter(user => !graph.hasVertex(user))

    const promises = newUsernames.map(newUsername => {
      graph.createNewEdge(username, newUsername)
      return eachUsername(newUsername, i + 1)
    })

    await Promise.all(promises)
  }

  await eachUsername(startUsername)

  const sinks: Sinks = Array.from(graph.sinks())
    .map(head)

  const distances: [Username, number][] = sinks
    .map(username => [
      username,
      graph.path(startUsername, username).length - 1
    ])

  const longestPath: Username[] = graph.path(startUsername, last(sinks))

  return { distances, longestPath }
}
