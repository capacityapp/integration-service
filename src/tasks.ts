import uniqBy from 'lodash.uniqby'
import groupBy from 'lodash.groupby'

import { streamQuery } from 'databaseClient'
import { post, put } from 'apiClient'
import { logger } from 'logger'

const MATTER_BATCH_SIZE = process.env.MATTER_BATCH_SIZE
  ? parseInt(process.env.MATTER_BATCH_SIZE, 10)
  : 2000

export const streamMattersToApi = async () => {
  if (!process.env.MATTER_QUERY) {
    logger.info('Not streaming matters as no matters query supplied')
    return
  }

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
  if (!process.env.CLIENT_QUERY) {
    logger.info('Not streaming clients as no clients query supplied')
    return
  }

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

const PROFILE_BATCH_SIZE = process.env.PROFILE_BATCH_SIZE
  ? parseInt(process.env.PROFILE_BATCH_SIZE, 10)
  : 2000

export const streamProfilesToApi = async () => {
  if (!process.env.PROFILE_QUERY) {
    logger.info('Not streaming profiles as no profiles query supplied')
    return
  }

  logger.info('Querying profiles table')

  await streamQuery({
    query: process.env.PROFILE_QUERY,
    batchSize: PROFILE_BATCH_SIZE,
    action: async (rows) => {
      logger.info(`Sending batch of ${rows?.length} profiles to API`)

      await post({
        endpoint: 'integration/profiles',
        query: { state: process.env.SUBDOMAIN },
        body: uniqBy(rows, 'email'),
      })
    },
  })

  logger.info(`Finished sending clients to API`)
}

const HISTORIC_UTILISATION_BATCH_SIZE = process.env
  .HISTORIC_UTILISATION_BATCH_SIZE
  ? parseInt(process.env.HISTORIC_UTILISATION_BATCH_SIZE, 10)
  : 10000

export const streamHistoricUtilisationToApi = async () => {
  if (!process.env.HISTORIC_UTLISATION_QUERY) {
    logger.info(
      'Not streaming historic utilisation as no historic utilisation query supplied',
    )
    return
  }

  logger.info('Querying historic utilisation table')

  await streamQuery({
    query: process.env.HISTORIC_UTLISATION_QUERY,
    batchSize: HISTORIC_UTILISATION_BATCH_SIZE,
    action: async (rows) => {
      const groups = groupBy(rows, 'email')

      await Promise.all(
        Object.keys(groups).map(async (email) => {
          if (email === 'undefined') {
            logger.error(
              '"email" column not included in historic utilisation table so not sending data',
            )
            return
          }
          const data = groups[email]

          logger.info(
            `Sending ${data?.length} rows of historic utilisation for ${email} to API`,
          )

          await post({
            endpoint: `integration/profiles/${email}/utilisation`,
            query: { state: process.env.SUBDOMAIN },
            body: data,
          })
        }),
      )
    },
  })

  logger.info(`Finished sending historic utilisation to API`)
}
