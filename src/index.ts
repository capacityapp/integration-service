import schedule from 'node-schedule'

import { logger } from 'logger'
import { createRunGuard } from 'runGuard'
import {
  streamClientsToApi,
  streamHistoricUtilisationToApi,
  streamMattersToApi,
  streamOutOfOfficeDatesToApi,
  streamProfilesToApi,
} from 'tasks'

const stage = async ({
  name,
  run,
}: {
  name: string
  run: () => Promise<void>
}) => {
  try {
    await run()
    logger.info(
      { stage: name, status: 'completed' },
      'Integration stage completed',
    )
    return true
  } catch {
    logger.error(
      { stage: name, status: 'failed' },
      'Integration stage failed; check source and API delivery',
    )
    return false
  }
}

const run = createRunGuard({
  onSkip: () =>
    logger.warn('Integration run skipped: previous run still active'),
  run: async () => {
    // allSettled keeps the overlap guard held until both independent chains end.
    await Promise.allSettled([
      (async () => {
        const profiles = await stage({
          name: 'profiles',
          run: streamProfilesToApi,
        })
        if (!profiles) return
        await stage({
          name: 'daily_utilisation',
          run: streamHistoricUtilisationToApi,
        })
        await stage({ name: 'out_of_office', run: streamOutOfOfficeDatesToApi })
      })(),
      (async () => {
        const clients = await stage({
          name: 'clients',
          run: streamClientsToApi,
        })
        if (clients) await stage({ name: 'matters', run: streamMattersToApi })
      })(),
    ])
  },
})

void run().catch(() => logger.error('Integration run failed'))
const job = schedule.scheduleJob(process.env.SCHEDULE_PATTERN, () => {
  void run().catch(() => logger.error('Integration run failed'))
})
if (!job) throw new Error('INVALID_INTEGRATION_SCHEDULE')
