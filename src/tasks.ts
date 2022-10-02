import uniqBy from 'lodash.uniqby'

import { streamQuery } from 'databaseClient'
import { put } from 'apiClient'
import { logger } from 'logger'

const MATTER_BATCH_SIZE = process.env.MATTER_BATCH_SIZE
  ? parseInt(process.env.MATTER_BATCH_SIZE, 10)
  : 2000

export const streamMattersToApi = async () => {
  logger.info('Querying matters table')

  await streamQuery({
    query: process.env.MATTER_QUERY,
    batchSize: MATTER_BATCH_SIZE,
    action: async (rows) => {
      logger.info(`Sending batch of ${rows?.length} matters to API`)

      await put({
        endpoint: 'integration/matters',
        query: { state: process.env.SUBDOMAIN },
        body: uniqBy(rows, 'matterNumber'),
      })
    },
  })

  logger.info(`Finished sending matters to API`)
}

const CLIENT_BATCH_SIZE = process.env.CLIENT_BATCH_SIZE
  ? parseInt(process.env.CLIENT_BATCH_SIZE, 10)
  : 2000

export const streamClientsToApi = async () => {
  logger.info('Querying clients table')

  await streamQuery({
    query: process.env.CLIENT_QUERY,
    batchSize: CLIENT_BATCH_SIZE,
    action: async (rows) => {
      logger.info(`Sending batch of ${rows?.length} clients to API`)

      await put({
        endpoint: 'integration/clients',
        query: { state: process.env.SUBDOMAIN },
        body: uniqBy(rows, 'clientNumber'),
      })
    },
  })

  logger.info(`Finished sending clients to API`)
}
