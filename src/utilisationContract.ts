export const utilisationEndpoint = (format?: string) => {
  if (format === 'daily') return 'integration/utilisation/historic'
  if (!format || format === 'legacy_weekly') return 'integration/utilisation'
  throw new Error('INVALID_UTILISATION_FORMAT')
}
