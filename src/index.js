// @flow

import Graph from 'graph-data-structure'

import { getUsernames } from './get-usernames'

const startUsername = process.argv[2]

type EndOfChain = {
  i: number,
  username: string
}

getChain(startUsername).then(arr =>
  console.log(arr
    .map(e => '@' + e)
    .join(' -> ')
  ))

async function getChain (startUsername: string): Promise<string[]> {
  const graph = Graph()
  const cache: Set<string> = new Set()
  const paths: EndOfChain[] = []

  async function eachUsername (username: string, i: number = 0) {
    const usernames = await getUsernames(username)
    console.log(username, '->', usernames)

    const newUsernames = usernames.filter(user => !cache.has(user))

    if (!newUsernames.length) paths.push({ i, username })

    const promises = newUsernames.map(newUsername => {
      cache.add(newUsername)
      graph.addEdge(username, newUsername)
      return eachUsername(newUsername, i + 1)
    })

    await Promise.all(promises)
  }

  await eachUsername(startUsername)

  const max = paths.reduce((a, b) => a.i > b.i ? a : b)

  return graph.shortestPath(startUsername, max.username)
}
