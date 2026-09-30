export const validateBatchResponse = ({
  body,
  submitted,
  requireResults,
}: {
  body: string
  submitted: number
  requireResults: boolean
}) => {
  // Older Capacity endpoints returned an empty successful response.
  if (!body.trim() && !requireResults) return
  let parsed: { results?: Array<{ index: number; status: string }> }
  try {
    parsed = JSON.parse(body)
  } catch {
    throw new Error('INVALID_API_RESPONSE')
  }
  if (!parsed || !Array.isArray(parsed.results))
    throw new Error('INVALID_API_RESPONSE')
  const indexes = new Set(
    parsed.results.map((result) => result && result.index),
  )
  if (
    parsed.results.length !== submitted ||
    indexes.size !== submitted ||
    parsed.results.some(
      (result) =>
        !result ||
        !Number.isInteger(result.index) ||
        result.index < 0 ||
        result.index >= submitted ||
        result.status !== 'saved',
    )
  ) {
    throw new Error('BATCH_RECORDS_REJECTED')
  }
}
