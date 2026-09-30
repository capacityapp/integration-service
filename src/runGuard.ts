export const createRunGuard = ({
  run,
  onSkip,
}: {
  run: () => Promise<void>
  onSkip: () => void
}) => {
  let running = false
  return async () => {
    if (running) {
      onSkip()
      return
    }
    running = true
    try {
      await run()
    } finally {
      running = false
    }
  }
}
