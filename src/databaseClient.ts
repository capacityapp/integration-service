import * as sql from 'mssql'

import { processStream } from 'processStream'

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  connectionTimeout: 30000,
  requestTimeout: 120000,
  options: { encrypt: process.env.DB_ENCRYPT === 'true' },
}

const azureConfig = {
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  connectionTimeout: 30000,
  requestTimeout: 120000,
  authentication: {
    type: 'azure-active-directory-password',
    options: {
      clientId: process.env.AZURE_CLIENT_ID,
      userName: process.env.AZURE_USER_NAME,
      password: process.env.AZURE_PASSWORD,
      domain: process.env.AZURE_TENANT_ID,
    },
  },
}

export const streamQuery = async ({
  query,
  action,
  batchSize,
}: {
  query: string
  action: (rows: Array<Record<string, unknown>>) => Promise<void>
  batchSize: number
}) => {
  const pool = new sql.ConnectionPool(
    process.env.AZURE_USER_NAME ? azureConfig : config,
  )
  // Never log driver errors: they may contain SQL or source values.
  pool.on('error', () => undefined)
  try {
    await pool.connect()
    const request = new sql.Request(pool)
    await processStream({
      request,
      query,
      action,
      batchSize,
      timeoutMs: 600000,
    })
  } finally {
    await pool.close()
  }
}
