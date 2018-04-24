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

    if (!usernames.length) paths.push({ i, username })

    const promises = usernames.map(newUsername => {
      if (cache.has(newUsername)) return Promise.resolve()
      cache.add(newUsername)

      graph.addEdge(username, newUsername)

      return eachUsername(newUsername, ++i)
    })

    await Promise.all(promises)
  }

  await eachUsername(startUsername)

  const max = paths.reduce((a, b) => a.i > b.i ? a : b)

  return graph.shortestPath(startUsername, max.username)
}
