import got from 'got'
import queryString from 'query-string'

import { validateBatchResponse } from 'batchResponse'

export const post = async ({ endpoint, body, query }) => {
  const response = await got.post(`${process.env.BASE_URL}/${endpoint}`, {
    json: body,
    headers: { Authorization: `Api-Key ${process.env.API_KEY}` },
    search: queryString.stringify(query),
    timeout: { request: 120000 },
    retry: { limit: 0 },
    followRedirect: false,
    throwHttpErrors: false,
  })
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error('HTTP_DELIVERY_FAILED')
  }
  validateBatchResponse({
    body: response.body,
    submitted: body.length,
    requireResults: process.env.REQUIRE_BATCH_RESULTS === 'true',
  })
}
