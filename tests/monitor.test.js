const assert = require('node:assert/strict')
const { test } = require('node:test')
const { EventEmitter } = require('node:events')
const { validateBatchResponse } = require('../dist/batchResponse')
const { createRunGuard } = require('../dist/runGuard')
const { processStream } = require('../dist/processStream')
const { utilisationEndpoint } = require('../dist/utilisationContract')
const { post } = require('../dist/apiClient')
const { createServer } = require('node:http')

test('HTTP delivery carries the tenant and rejects per-row errors and redirects without retry', async () => {
  const requests = []
  const server = createServer((req, res) => {
    requests.push(req.url)
    req.resume()
    if (req.url.startsWith('/redirect')) {
      res.writeHead(302, { Location: '/elsewhere' })
      res.end()
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          results: [{ index: 0, status: 'error', error: 'PRIVATE_RESPONSE' }],
        }),
      )
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const previous = process.env.BASE_URL
  process.env.BASE_URL = `http://127.0.0.1:${server.address().port}`
  try {
    await assert.rejects(
      post({
        endpoint: 'integration/profiles',
        body: [{}],
        query: { state: 'synthetic-tenant' },
      }),
      /BATCH_RECORDS_REJECTED/,
    )
    await assert.rejects(
      post({
        endpoint: 'redirect',
        body: [{}],
        query: { state: 'synthetic-tenant' },
      }),
      /HTTP_DELIVERY_FAILED/,
    )
    assert.deepEqual(requests, [
      '/integration/profiles?state=synthetic-tenant',
      '/redirect?state=synthetic-tenant',
    ])
  } finally {
    if (previous === undefined) delete process.env.BASE_URL
    else process.env.BASE_URL = previous
    await new Promise((resolve) => server.close(resolve))
  }
})

test('recognises failed rows inside HTTP 200 without exposing values', () => {
  const check = (results) =>
    validateBatchResponse({
      body: JSON.stringify({ results }),
      submitted: 2,
      requireResults: true,
    })
  assert.doesNotThrow(() =>
    check([
      { index: 0, status: 'saved' },
      { index: 1, status: 'saved' },
    ]),
  )
  assert.throws(
    () =>
      check([
        { index: 0, status: 'saved' },
        { index: 1, status: 'error', error: 'PRIVATE_CANARY' },
      ]),
    /^Error: BATCH_RECORDS_REJECTED$/,
  )
  assert.throws(() =>
    check([
      { index: 0, status: 'saved' },
      { index: 0, status: 'saved' },
    ]),
  )
  assert.throws(() => check([null, {}]))
  assert.doesNotThrow(() =>
    validateBatchResponse({ body: '', submitted: 1, requireResults: false }),
  )
  assert.throws(() =>
    validateBatchResponse({ body: '', submitted: 1, requireResults: true }),
  )
})

test('overlapping runs skip and a failed run releases the guard', async () => {
  let release
  let skipped = 0
  const run = createRunGuard({
    run: () =>
      new Promise((resolve) => {
        release = resolve
      }),
    onSkip: () => {
      skipped += 1
    },
  })
  const first = run()
  await run()
  assert.equal(skipped, 1)
  release()
  await first
  const next = run()
  release()
  await next
  let attempts = 0
  const failure = createRunGuard({
    run: async () => {
      attempts += 1
      throw new Error('failed')
    },
    onSkip: () => {},
  })
  await assert.rejects(failure())
  await assert.rejects(failure())
  assert.equal(attempts, 2)
})

const requestFixture = (start) => {
  const request = new EventEmitter()
  request.pause = () => {}
  request.resume = () => {}
  request.cancel = () => {
    request.cancelled = true
  }
  request.query = () => start(request)
  return request
}

test('SQL errors reject, cancel, and do not leak source errors', async () => {
  const request = requestFixture((req) =>
    req.emit('error', new Error('PRIVATE_SQL')),
  )
  await assert.rejects(
    processStream({
      request,
      query: 'private query',
      action: async () => {},
      batchSize: 2,
      timeoutMs: 1000,
    }),
    /^Error: SOURCE_QUERY_FAILED$/,
  )
  assert.equal(request.cancelled, true)
})

test('HTTP failures reject a paused stream instead of hanging', async () => {
  const request = requestFixture((req) =>
    req.emit('row', { employee: 'private' }),
  )
  await assert.rejects(
    processStream({
      request,
      query: 'private',
      action: async () => {
        throw new Error('private response')
      },
      batchSize: 1,
      timeoutMs: 1000,
    }),
    /^Error: BATCH_DELIVERY_FAILED$/,
  )
  assert.equal(request.cancelled, true)
})

test('completion waits for the last batch and never posts a phantom empty batch', async () => {
  const batches = []
  const request = requestFixture((req) => {
    req.emit('row', { a: 1 })
    req.emit('row', { a: 2 })
    req.emit('done')
  })
  await processStream({
    request,
    query: 'private',
    action: async (rows) => {
      batches.push(rows)
    },
    batchSize: 2,
    timeoutMs: 1000,
  })
  assert.equal(batches.length, 1)
  assert.equal(batches[0].length, 2)
  const empty = requestFixture((req) => req.emit('done'))
  await processStream({
    request: empty,
    query: 'private',
    action: async () => {
      assert.fail('empty batch')
    },
    batchSize: 2,
    timeoutMs: 1000,
  })
})

test('stalled SQL is bounded and cancelled', async () => {
  const request = requestFixture(() => {})
  await assert.rejects(
    processStream({
      request,
      query: 'private',
      action: async () => {},
      batchSize: 2,
      timeoutMs: 5,
    }),
    /SOURCE_TIMEOUT/,
  )
  assert.equal(request.cancelled, true)
})

test('daily data must explicitly opt in; weekly totals are not silently relabelled', () => {
  assert.equal(utilisationEndpoint(), 'integration/utilisation')
  assert.equal(utilisationEndpoint('daily'), 'integration/utilisation/historic')
  assert.throws(
    () => utilisationEndpoint('daliy'),
    /INVALID_UTILISATION_FORMAT/,
  )
})
