import * as sql from 'mssql'
import { logger } from 'logger'

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  options: {
    encrypt: false,
  },
}

const azureConfig = {
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  authentication: {
    type: 'azure-active-directory-password',
    options: {
      clientId: process.env.AZURE_CLIENT_ID,
      /**
       * A user need to provide `userName` asscoiate to their account.
       */
      userName: process.env.AZURE_USER_NAME,
      /**
       * A user need to provide `password` asscoiate to their account.
       */
      password: process.env.AZURE_PASSWORD,

      /**
       * Optional parameter for specific Azure tenant ID
       */
      domain: process.env.AZURE_TENANT_ID,
    },
  },
}

export const streamQuery = ({
  query,
  action,
  batchSize,
}: {
  query: string
  action: (rows: Array<any>) => Promise<void>
  batchSize: number
}) =>
  sql.connect(process.env.AZURE_USER_NAME ? azureConfig : config).then(
    (pool) =>
      new Promise<void>((resolve) => {
        const request = new sql.Request(pool)
        request.stream = true
        request.query(query)

        let rowsToProcess = []

        request.on('row', (row) => {
          rowsToProcess.push(row)
          if (rowsToProcess.length >= batchSize) {
            request.pause()
            action(rowsToProcess).then(() => {
              rowsToProcess = []
              request.resume()
            })
          }
        })

        request.on('error', (err) => {
          logger.error(err)
          throw err
        })

        request.on('done', () => {
          action(rowsToProcess).then(() => {
            rowsToProcess = []
            request.resume()
            resolve()
          })
        })
      }),
  )
