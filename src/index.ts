import schedule from 'node-schedule'

import {
  streamClientsToApi,
  streamHistoricUtilisationToApi,
  streamMattersToApi,
  streamProfilesToApi,
} from 'tasks'

streamProfilesToApi().then(streamHistoricUtilisationToApi)
streamClientsToApi().then(streamMattersToApi)

schedule.scheduleJob(process.env.SCHEDULE_PATTERN, async () => {
  await Promise.all([
    streamProfilesToApi().then(streamHistoricUtilisationToApi),
    streamClientsToApi().then(streamMattersToApi),
  ])
})
