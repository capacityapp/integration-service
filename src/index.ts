import schedule from 'node-schedule'

import { streamClientsToApi, streamMattersToApi } from 'tasks'

streamClientsToApi().then(streamMattersToApi)

schedule.scheduleJob(process.env.SCHEDULE_PATTERN, () =>
  streamClientsToApi().then(streamMattersToApi),
)
