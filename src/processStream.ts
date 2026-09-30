type Row = Record<string, unknown>
type Request = {
  stream: boolean
  on: (event: string, callback: (row?: Row) => void) => unknown
  query: (query: string) => unknown
  pause: () => unknown
  resume: () => unknown
  cancel: () => unknown
}

export const processStream = ({
  request,
  query,
  action,
  batchSize,
  timeoutMs,
}: {
  request: Request
  query: string
  action: (rows: Array<Row>) => Promise<void>
  batchSize: number
  timeoutMs: number
}) =>
  new Promise<void>((resolve, reject) => {
    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 10000) {
      reject(new Error('INVALID_BATCH_SIZE'))
      return
    }
    let settled = false
    let pending = Promise.resolve()
    let rows: Array<Row> = []
    const fail = (code: string) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try {
        request.cancel()
      } catch {
        /* cancellation is best effort */
      }
      reject(new Error(code))
    }
    const timer = setTimeout(() => fail('SOURCE_TIMEOUT'), timeoutMs)
    const flush = () => {
      if (!rows.length) return pending
      const batch = rows
      rows = []
      pending = pending.then(() => {
        if (settled) return
        return action(batch)
      })
      return pending
    }
    request.stream = true
    request.on('error', () => fail('SOURCE_QUERY_FAILED'))
    request.on('row', (row) => {
      if (settled) return
      rows.push(row)
      if (rows.length >= batchSize) {
        request.pause()
        flush().then(
          () => {
            if (!settled) request.resume()
          },
          () => fail('BATCH_DELIVERY_FAILED'),
        )
      }
    })
    request.on('done', () => {
      flush().then(
        () => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          resolve()
        },
        () => fail('BATCH_DELIVERY_FAILED'),
      )
    })
    try {
      request.query(query)
    } catch {
      fail('SOURCE_QUERY_FAILED')
    }
  })
