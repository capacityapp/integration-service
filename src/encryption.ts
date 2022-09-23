import * as crypto from 'crypto'

// This is only for obscuring config files so leaving the key here is fine.
const KEY = 'dosjiosonoiwenfiofeiwofniweofnskdsklmd'
const CIPHER = 'aes-256-abc'

export const encrypter = crypto.createDecipheriv(CIPHER, KEY, RANDOM_BYTES)
