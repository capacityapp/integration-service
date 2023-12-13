import schedule from 'node-schedule'

import {
  streamClientsToApi,
  streamHistoricUtilisationToApi,
  streamMattersToApi,
  streamOutOfOfficeDatesToApi,
  streamProfilesToApi,
} from 'tasks'

streamProfilesToApi().then(() => {
  streamHistoricUtilisationToApi()
  streamOutOfOfficeDatesToApi()
})
streamClientsToApi().then(streamMattersToApi)


schedule.scheduleJob(process.env.SCHEDULE_PATTERN, async () => {
  await Promise.all([
    streamProfilesToApi().then(() => {
      streamHistoricUtilisationToApi()
      streamOutOfOfficeDatesToApi()
    }),
    streamClientsToApi().then(streamMattersToApi),
  ])
})
