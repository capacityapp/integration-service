import uniqBy from 'lodash.uniqby'
import log from 'loglevel'

import { streamQuery } from 'databaseClient'
import { put } from 'apiClient'

const MATTER_BATCH_SIZE = process.env.MATTER_BATCH_SIZE
  ? parseInt(process.env.MATTER_BATCH_SIZE, 10)
  : 2000

export const streamMattersToApi = async () => {
  log.debug('Querying matters table')

  await streamQuery({
    query: process.env.MATTER_QUERY,
    batchSize: MATTER_BATCH_SIZE,
    action: async (rows) => {
      log.debug(`Sending batch of ${rows?.length} matters to API`)

      await put({
        endpoint: 'integration/matters',
        query: { state: process.env.SUBDOMAIN },
        body: uniqBy(rows, 'matterNumber'),
      })
    },
  })

  log.debug(`Finished sending matters to API`)
}

const CLIENT_BATCH_SIZE = process.env.CLIENT_BATCH_SIZE
  ? parseInt(process.env.CLIENT_BATCH_SIZE, 10)
  : 2000

export const streamClientsToApi = async () => {
  log.debug('Querying clients table')

  await streamQuery({
    query: process.env.CLIENT_QUERY,
    batchSize: CLIENT_BATCH_SIZE,
    action: async (rows) => {
      log.debug(`Sending batch of ${rows?.length} clients to API`)

      await put({
        endpoint: 'integration/clients',
        query: { state: process.env.SUBDOMAIN },
        body: uniqBy(rows, 'clientNumber'),
      })
    },
  })

  log.debug(`Finished sending clients to API`)
}
